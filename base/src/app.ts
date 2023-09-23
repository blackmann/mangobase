import * as errors from './errors'
import {
  BadRequest,
  Conflict,
  InternalServerError,
  MethodNotAllowed,
  NotFound,
  ServiceError,
} from './errors'
import { Database, Migration, MigrationStep } from './database'
import type { HookConfig, HookFn, Hooks } from './hook'
import Manifest, { CollectionConfig } from './manifest'
import Schema, { ValidationError } from './schema'
import dbMigrations, { saveMigration } from './db-migrations'
import logger, { logEnd, logStart } from './logger'
import { onDev, unexposed } from './lib/api-paths'
import CollectionService from './collection-service'
import type { Context } from './context'
import HooksRegistry from './hooks-registry'
import Method from './method'
import { baseAuthentication } from './authentication'
import { createRouter } from 'radix3'
import randomStr from './lib/random-str'
import users from './users'

const INTERNAL_PATHS = [
  'collections',
  '_dev/hooks',
  '_dev/hooks-registry',
  '_dev/editors',
]

const STATIC_PATHS = ['/assets/', '/zed-mono/']

const DEV = process.env.NODE_ENV !== 'production'

type Handle = (ctx: Context, app: App) => Promise<Context>

interface WithSchema {
  schema: Schema
}

interface Service {
  handle: Handle
}

/**
 * A pipeline represents the call stack for a service. With a pipeline, we can register
 * a series of hooks for a service. The pipeline is responsible for running hooks in the
 * correct order and handling/propagating errors correctly.
 *
 * Use the {@link Pipeline.before | `before`} and {@link Pipeline.after | `after`} methods to register hooks.
 */
class Pipeline {
  private app: App
  private _service: Service
  private hooks: Hooks = Pipeline.stubHooks()

  constructor(app: App, service: Service) {
    this.app = app
    this._service = service
  }

  get service() {
    return this._service
  }

  /**
   * Passes the context through the before hooks registered on the app, followed by hooks
   * registered on the service. After all before-hooks are called, the context is passed to the service.
   * The result from the service is then passed through all after hooks.
   *
   * If a before-hook happens to set the result of the context to a non-null result, the pipeline
   * does not call the subsequent before-hooks and also skips the service but runs all after-hooks with
   * the current context.
   *
   * When there's an error/exception, the pipeline tries to handle it cleanly
   * and return a context with the respective status code and result. In this case, the after
   * hooks are not called; rather the error hooks registered on the app are called.
   *
   */
  async run(ctx: Context): Promise<Context> {
    try {
      ctx = await this.app.runBefore(ctx)
    } catch (err) {
      return this.handlePipelineError(err, ctx)
    }

    for (const [hook, config] of this.hooks.before[ctx.method]) {
      try {
        ctx = await hook(ctx, config, this.app)

        if (ctx.result) {
          // if there's already a result, we wouldn't want it to be overwritten
          // by subsequent hooks or the service. Maybe this was provided from some
          // cache or something.
          break
        }
      } catch (err) {
        return this.handlePipelineError(err, ctx)
      }
    }

    if (ctx.result === undefined) {
      try {
        ctx = await this.service.handle(ctx, this.app)
        if (ctx.method !== 'remove' && ctx.result === undefined) {
          throw new NotFound()
        }
      } catch (err) {
        return this.handlePipelineError(err, ctx)
      }
    }

    for (const [hook, config] of this.hooks.after[ctx.method]) {
      try {
        ctx = await hook(ctx, config, this.app)
      } catch (err) {
        return this.handlePipelineError(err, ctx)
      }
    }

    if (!ctx.statusCode) {
      ctx.statusCode = 200
    }

    try {
      ctx = await this.app.runAfter(ctx)
    } catch (err) {
      return this.handlePipelineError(err, ctx)
    }

    return ctx
  }

  private async handlePipelineError(
    err: unknown,
    ctx: Context
  ): Promise<Context> {
    ctx = await Pipeline.handleError(err, ctx)
    return this.app.runError(ctx)
  }

  hook(
    when: 'after' | 'before',
    method: `${Method}`,
    hook: HookFn,
    config?: HookConfig
  ) {
    if (when === 'after') {
      return this.after(method, hook, config)
    }

    return this.before(method, hook, config)
  }

  after(method: `${Method}`, hook: HookFn, config?: HookConfig): Pipeline {
    this.hooks.after[method].push([hook, config])
    return this
  }

  before(method: `${Method}`, hook: HookFn, config?: HookConfig): Pipeline {
    this.hooks.before[method].push([hook, config])
    return this
  }

  static async handleError(
    err: any,
    ctx: Context,
    clean?: (ctx: Context) => Promise<Context>
  ): Promise<Context> {
    const error =
      err instanceof ServiceError ? err : Pipeline.translateError(err)

    ctx.result = {
      details: error.data,
      error: error.message || error.name,
    }

    ctx.statusCode = error.statusCode

    if (clean) {
      ctx = await clean(ctx)
    }

    return ctx
  }

  static translateError(err: any) {
    if (err instanceof ValidationError) {
      return new BadRequest(err.message, err.detail)
    }

    DEV && console.error(err)

    return new InternalServerError(`Unknown error: ${err.message}`, err)
  }

  static stubHooks(): Hooks {
    return {
      after: {
        create: [],
        find: [],
        get: [],
        patch: [],
        remove: [],
      },
      before: {
        create: [],
        find: [],
        get: [],
        patch: [],
        remove: [],
      },
    }
  }
}

class AnonymouseService implements Service {
  handle: Handle

  constructor(handle: Handle) {
    this.handle = handle
  }
}

const collectionsService: Service & WithSchema = {
  async handle(ctx: Context, app: App) {
    if (ctx.method !== 'get' && ctx.user?.role !== 'dev') {
      throw new errors.Unauthorized()
    }

    switch (ctx.method) {
      case 'create': {
        if (ctx.params?.id) {
          throw new MethodNotAllowed(
            '`create` method not allowed on detail path'
          )
        }

        if (await app.manifest.collection(ctx.data?.name)) {
          throw new Conflict(
            `A collection with name \`${ctx.data?.name}\` already exists`
          )
        }

        const validData = this.schema.validate(ctx.data, true)
        Schema.validateSchema(validData.schema)

        const { migrationSteps, ...data } = validData

        const collection = (await app.manifest.collection(data.name, data))!
        await handleMigration(migrationSteps, app)

        await app.database.syncIndex(collection.name, collection.indexes)

        app.use(collection.name, new CollectionService(app, collection.name))

        ctx.result = collection
        ctx.statusCode = 201
        return ctx
      }

      case 'find': {
        const nameSort = Number(ctx.query.$sort?.name || '1')
        const collections = await app.manifest.collections()
        ctx.result = collections.sort(
          (a, b) => a.name.localeCompare(b.name) * nameSort
        )
        return ctx
      }

      case 'get': {
        const collection = await app.manifest.collection(ctx.params!.id)
        ctx.result = collection

        return ctx
      }

      case 'patch': {
        if (!ctx.params?.id) {
          throw new MethodNotAllowed('`patch` method not allowed on base path')
        }

        const existing = await app.manifest.collection(ctx.params!.id)

        if (!existing) {
          throw new NotFound()
        }

        const validData = await this.schema.validate(ctx.data, false, true)
        if (validData.schema) {
          Schema.validateSchema(validData.schema)
        }

        const { migrationSteps, ...patch } = validData
        const collectionConfig = {
          ...existing,
          ...patch,
        }

        if (existing.name !== collectionConfig.name) {
          await app.manifest.renameCollection(
            existing.name,
            collectionConfig.name
          )
          app.leave(existing.name)
        }

        // [ ] Remove/add collection from schema refs based on `collection.template`

        const collection = (await app.manifest.collection(
          collectionConfig.name,
          collectionConfig
        ))!

        await handleMigration(migrationSteps, app)

        await app.database.syncIndex(collection.name, collection.indexes)

        await app.installCollection(collection)

        ctx.result = collection

        return ctx
      }

      case 'remove': {
        if (!ctx.params?.id) {
          throw new MethodNotAllowed('`remove` method not allowed on base path')
        }

        await app.manifest.removeCollection(ctx.params.id)
        app.leave(ctx.params!.id)
        return ctx
      }
    }
  },

  schema: new Schema({
    exposed: { defaultValue: true, type: 'boolean' },
    indexes: {
      defaultValue: [],
      schema: {
        item: {
          schema: {
            fields: { schema: { item: { type: 'string' } }, type: 'array' },
            options: {
              schema: { unique: { type: 'boolean' } },
              type: 'object',
            },
          },
          type: 'object',
        },
      },
      type: 'array',
    },
    migrationSteps: {
      defaultValue: [],
      schema: {
        item: {
          schema: {
            // [ ] Provide schema definitions
          },
          type: 'object',
        },
      },
      type: 'array',
    },
    name: { required: true, type: 'string' },
    schema: { required: true, type: 'any' },
    template: { defaultValue: false, type: 'boolean' },
  }),
}

const devSetupService: Service = {
  async handle(ctx, app) {
    if (ctx.method !== 'find') {
      throw new MethodNotAllowed()
    }

    const usersService = app.service('users') as CollectionService
    const collection = usersService.collection
    const { data } = await collection.find({ query: { role: 'dev' } })
    ctx.result = data.length > 0

    return ctx
  },
}

const editorService: Service = {
  async handle(ctx, app) {
    switch (ctx.method) {
      case 'get': {
        const editor = await app.manifest.getEditor(ctx.params?.id)
        ctx.result = editor
        return ctx
      }

      case 'patch': {
        const collection = ctx.params?.id as string
        await app.manifest.setEditor(collection, ctx.data)

        ctx.result = ctx.data

        return ctx
      }
      default:
        throw new MethodNotAllowed()
    }
  },
}

const hooksRegistry: Service = {
  async handle(ctx, app) {
    switch (ctx.method) {
      case 'find': {
        ctx.result = app.hooksRegistry.list()

        return ctx
      }

      default:
        throw new MethodNotAllowed()
    }
  },
}

const hooksService: Service = {
  async handle(ctx, app) {
    switch (ctx.method) {
      case 'patch': {
        // the id is the collection name
        // [ ] Validate hook
        const collectionName = ctx.params?.id as string
        await app.manifest.setHooks(collectionName, ctx.data)

        // reinstall collection with hooks
        const collection = await app.manifest.collection(collectionName)

        if (!collection) {
          throw new NotFound(
            `No collection with name \`${collectionName}\` found`
          )
        }

        await app.installCollection(collection)

        ctx.result = await app.manifest.getHooks(collectionName)

        return ctx
      }

      case 'get': {
        const hooks = await app.manifest.getHooks(ctx.params!.id)
        ctx.result = hooks

        return ctx
      }

      default: {
        throw new MethodNotAllowed()
      }
    }
  },
}

const schemaRefsService: Service & WithSchema = {
  async handle(ctx, app) {
    switch (ctx.method) {
      case 'find': {
        ctx.result = await app.manifest.schemaRefs()
        return ctx
      }

      case 'create': {
        const data = this.schema.validate(ctx.data, true)
        Schema.validateSchema(data.schema)
        ctx.result = await app.manifest.schemaRef(data.name, data)
        return ctx
      }

      case 'get': {
        const nameParts: (string | undefined)[] = [
          ctx.query.$scope as string | undefined,
          ctx.params!.id,
        ]

        const refName = nameParts.filter(Boolean).join('/')

        const ref = await app.manifest.schemaRef(refName)

        if (!ref) {
          throw new NotFound(`No schema ref with name \`${refName}\` found`)
        }

        ctx.result = {
          ...ref,
          $usages: await app.manifest.getSchemaRefUsages(refName),
        }

        return ctx
      }

      case 'patch': {
        const existing = await app.manifest.schemaRef(ctx.params!.id)
        if (!existing) {
          throw new NotFound(
            `No schema ref with name \`${ctx.params!.id}\` found`
          )
        }

        const data = this.schema.validate(ctx.data, false, true)
        if (data.schema) {
          Schema.validateSchema(data.schema)
        }

        if (data.name && existing.name !== data.name) {
          await app.manifest.renameSchemaRef(existing.name, data.name)
        }

        ctx.result = await app.manifest.schemaRef(data.name, {
          ...existing,
          ...data,
        })

        return ctx
      }

      default: {
        throw new MethodNotAllowed()
      }
    }
  },
  schema: new Schema({
    name: { required: true, type: 'string' },
    schema: { required: true, type: 'any' },
  }),
}

interface Options {
  db: Database
}

/**
 * An app is responsible for handling the API calls and also serving the admin pages.
 * App is designed to be server agnostic and only depends on {@link Context.query | contexts} for processing.
 * Contexts are processed with services but orchestrated with {@link Pipeline | pipelines}.
 * In summary, pipelines make sure {@link HookFn | hooks} are called properly and exceptions/
 * errors are propagated properly.
 */
class App {
  private routes = createRouter()
  database: Database
  manifest: Manifest
  hooksRegistry: HooksRegistry

  readonly errors = errors

  private beforeHooks: HookFn[] = []
  private afterHooks: HookFn[] = []
  private errorHooks: HookFn[] = []

  private initialize: Promise<void>

  constructor(options: Options) {
    this.database = options.db
    this.manifest = new Manifest()
    this.hooksRegistry = new HooksRegistry()
    this.hooksRegistry.installCommon()

    this.initialize = (async () => {
      await this.internalPlug(dbMigrations)

      this.addService('collections', collectionsService)
      this.addService(onDev('hooks-registry'), hooksRegistry)
      this.addService(onDev('hooks'), hooksService)
      this.addService(onDev('editors'), editorService)
      this.addService(onDev('dev-setup'), devSetupService)
      this.addService(onDev('schema-refs'), schemaRefsService)

      await this.internalPlug(logger)
      await this.internalPlug(users)
      await this.internalPlug(baseAuthentication)

      this.installCollectionsServices()
    })()
  }

  private init() {
    return this.initialize
  }

  use(path: string, handle: Handle): Pipeline
  use(path: string, service: Service): Pipeline
  use(path: string, handleOrService: Service | Handle): Pipeline {
    if (INTERNAL_PATHS.includes(path)) {
      throw new Error(
        `path \`${path}\` is an internal path. Overriding it will cause problems.`
      )
    }

    const service: Service =
      typeof handleOrService === 'function'
        ? new AnonymouseService(handleOrService)
        : handleOrService

    return this.addService(path, service)
  }

  leave(path: string) {
    this.routes.remove(`${path}`)
    this.routes.remove(`${path}/:id`)
  }

  private addService(path: string, service: Service) {
    const pipeline = new Pipeline(this, service)
    this.register(`${path}`, pipeline)
    this.register(`${path}/:id`, pipeline)

    return pipeline
  }

  private register(path: string, pipeline: Pipeline) {
    this.routes.insert(path, { pipeline })
  }

  pipeline(path: string): Pipeline | null {
    return this.routes.lookup(path)?.pipeline
  }

  service(path: string): Service | undefined {
    return this.pipeline(path)?.service
  }

  /**
   * Passes the context through its pipeline and returns a context with the result. This method
   * is not intended to throw an exception. Exceptions are caught and transformed into readable
   * responses with related status code.
   */
  async api(ctx: Context): Promise<Context> {
    await this.init()

    await logStart(ctx, undefined, this)

    const route = this.routes.lookup(ctx.path)
    if (!route) {
      const err = new NotFound(`No service/handler found for path ${ctx.path}`)
      return Pipeline.handleError(err, ctx)
    }

    ctx.params = route.params
    if (route.params?.id && ctx.method === 'find') {
      ctx.method = 'get'
    }

    const pipeline = route.pipeline as Pipeline

    ctx = await pipeline.run(ctx)
    logEnd(ctx, undefined, this)

    return ctx
  }

  private async installCollectionsServices() {
    const collections = await this.manifest.collections()
    for (const collection of collections) {
      await this.installCollection(collection)
    }
  }

  async installCollection(collection: CollectionConfig) {
    // remove old [possible] installations of this collection
    // [ ] Add middleware to prevent `_x/*` and `_dev/*` access by non-admin users
    const unexposedPath = unexposed(collection.name)
    const exposedPath = collection.name

    this.leave(unexposedPath)
    this.leave(exposedPath)

    const path = collection.exposed ? exposedPath : unexposedPath

    const pipeline = this.use(
      path,
      new CollectionService(this, collection.name)
    )

    const hooks = await this.manifest.getHooks(collection.name)
    if (!hooks) {
      return
    }

    for (const when of ['before', 'after'] as const) {
      for (const [method, hookList] of Object.entries(hooks[when])) {
        for (const [hookId, config] of hookList) {
          const hook = this.hooksRegistry.get(hookId)
          if (!hook) {
            throw new Error(`No hook with id: "${hookId}" exists.`)
          }

          pipeline.hook(when, method as Method, hook.run, config)
        }
      }
    }
  }

  before(...hooks: HookFn[]): App {
    this.beforeHooks.push(...hooks)
    return this
  }

  after(...hooks: HookFn[]): App {
    this.afterHooks.push(...hooks)
    return this
  }

  error(...hooks: HookFn[]): App {
    this.errorHooks.push(...hooks)
    return this
  }

  async runBefore(ctx: Context): Promise<Context> {
    for (const hook of this.beforeHooks) {
      ctx = await hook(ctx, undefined, this)
    }

    return ctx
  }

  async runAfter(ctx: Context): Promise<Context> {
    for (const hook of this.afterHooks) {
      ctx = await hook(ctx, undefined, this)
    }

    return ctx
  }

  async runError(ctx: Context): Promise<Context> {
    for (const hook of this.errorHooks) {
      try {
        ctx = await hook(ctx, undefined, this)
      } catch (err) {
        console.error('Error running error hook', hook.name, err)
      }
    }

    return ctx
  }

  private async internalPlug<T>(plugin: (app: App) => Promise<T>): Promise<T> {
    return await plugin(this)
  }

  async plug<T>(plugin: (app: App) => Promise<T>): Promise<T> {
    await this.init()
    return await plugin(this)
  }

  async admin(path: string) {
    await this.init()

    const basePath = `${__dirname}/admin/`

    if (STATIC_PATHS.some((staticPath) => path.startsWith(staticPath))) {
      const trimmedPath = path.replace(/^\//, '')
      return [basePath, trimmedPath].join('')
    }

    return [basePath, 'index.html'].join('')
  }

  serve<T>(server: (app: App) => T): T {
    return server(this)
  }

  static isDevPath(path: string) {
    return path.startsWith('_dev/')
  }
}

async function handleMigration(migrationSteps: MigrationStep[], app: App) {
  if (migrationSteps.length) {
    let lastVersion =
      (await app.manifest.getLastMigrationCommit())?.version || 0

    const version = ++lastVersion
    const migration: Migration = {
      id: uniqueId(version),
      steps: migrationSteps,
      version,
    }

    await app.database.migrate(migration)
    await app.manifest.commitMigration(migration)

    await saveMigration(app, migration)
  }
}

function uniqueId(version: number) {
  return `${version.toString().padStart(4, '0')}_${randomStr(8)}`
}

export default App
export { Pipeline, INTERNAL_PATHS }
export type { Handle, Service }
