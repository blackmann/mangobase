import {
  BadRequest,
  InternalServerError,
  NotFound,
  ServiceError,
} from './errors'
import Schema, { ValidationError } from './schema'
import type { Context } from './context'
import { Database } from './database'
import { HookConfig } from './hook'
import HooksRegistry from './hooks-registry'
import Manifest from './manifest'
import Method from './method'
import { createRouter } from 'radix3'

type Handle = (ctx: Context, app: App) => Promise<Context>

interface Service {
  handle: Handle
}

type HookFn = (ctx: Context, config: any, app: App) => Promise<Context>

type Hooks = {
  after: Record<`${Method}`, [HookFn, HookConfig?][]>
  before: Record<`${Method}`, [HookFn, HookConfig?][]>
}

class Pipeline {
  private app: App
  private service: Service
  private hooks: Hooks = Pipeline.stubHooks()

  constructor(app: App, service: Service) {
    this.app = app
    this.service = service
  }

  async run(ctx: Context): Promise<Context> {
    // run app before hooks

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
        return Pipeline.handleError(err, ctx)
      }
    }

    if (!ctx.result) {
      try {
        ctx = await this.service.handle(ctx, this.app)
        if (ctx.method !== 'remove' && !ctx.result) {
          throw new NotFound()
        }
      } catch (err) {
        return Pipeline.handleError(err, ctx)
      }
    }

    for (const [hook, config] of this.hooks.after[ctx.method]) {
      try {
        ctx = await hook(ctx, config, this.app)
      } catch (err) {
        return Pipeline.handleError(err, ctx)
      }
    }

    // run app after hooks

    if (!ctx.statusCode) {
      ctx.statusCode = 200
    }

    return ctx
  }

  after(method: `${Method}`, hook: HookFn, config?: HookConfig): Pipeline {
    this.hooks.after[method].push([hook, config])
    return this
  }

  before(method: `${Method}`, hook: HookFn, config?: HookConfig): Pipeline {
    this.hooks.before[method].push([hook, config])
    return this
  }

  static handleError(err: any, ctx: Context): Context {
    // TODO: put into logs

    const error =
      err instanceof ServiceError ? err : Pipeline.translateError(err)

    ctx.result = {
      details: error.data,
      error: error.message || error.name,
    }

    ctx.statusCode = error.statusCode

    return ctx
  }

  static translateError(err: any) {
    if (err instanceof ValidationError) {
      return new BadRequest(err.message, err.detail)
    }

    return new InternalServerError('Unknown error', err)
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

const collectionsService: Service & { schema: Schema } = {
  async handle(ctx: Context, app: App) {
    switch (ctx.method) {
      case 'create': {
        const data = await this.schema.validate(ctx.data, true)
        Schema.validateSchema(data.schema)

        const collection = await app.manifest.collection(data.name, data)

        // TODO: Register this service

        ctx.result = collection
        ctx.statusCode = 201
        return ctx
      }
      case 'find': {
        const collections = Object.values(app.manifest.collections)
        ctx.result = collections
        return ctx
      }

      case 'get': {
        const collection = await app.manifest.collection(ctx.params!.id)
        ctx.result = collection

        return ctx
      }

      case 'patch': {
        const existing = await app.manifest.collection(ctx.params!.id)

        if (!existing) {
          throw new NotFound()
        }

        const patch = await this.schema.validate(ctx.data, true, true)
        const collection = await app.manifest.collection(ctx.params!.id, {
          ...existing,
          ...patch,
        })

        // TODO: Re-initialize the collection service

        ctx.result = collection

        return ctx
      }

      case 'remove': {
        await app.manifest.removeCollection(ctx.params!.id)
        // TODO: Close this service
        return ctx
      }
    }
  },

  schema: new Schema({
    exposed: { defaultValue: true, type: 'boolean' },
    name: { required: true, type: 'string' },
    schema: { required: true, type: 'any' },
    template: { defaultValue: false, type: 'boolean' },
  }),
}

interface Options {
  db: Database
}

class App {
  private routes = createRouter()
  database: Database
  manifest: Manifest
  hooksRegistry: HooksRegistry

  private initialize: Promise<void>

  constructor(options: Options) {
    this.database = options.db
    this.manifest = new Manifest()
    this.hooksRegistry = new HooksRegistry()

    this.initialize = (async () => {
      this.use('collections', collectionsService)
    })()
  }

  async init() {
    return this.initialize
  }

  use(path: string, handle: Handle): Pipeline
  use(path: string, service: Service): Pipeline
  use(path: string, handleOrService: Service | Handle): Pipeline {
    const service: Service =
      typeof handleOrService === 'function'
        ? new AnonymouseService(handleOrService)
        : handleOrService

    const pipeline = new Pipeline(this, service)
    this.register(`${path}`, pipeline)
    this.register(`${path}/:id`, pipeline)

    return pipeline
  }

  private register(path: string, pipeline: Pipeline) {
    this.routes.insert(path, { pipeline })
  }

  async serve(ctx: Context): Promise<Context> {
    await this.init()

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

    return await pipeline.run(ctx)
  }

  async static() {
    await this.init()
  }
}

export default App
export { Pipeline }
export type { Handle, Service }
