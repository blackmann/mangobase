import { Index, Migration } from './database.js'
import { SchemaDefinitions, findRelations } from './schema.js'
import { Conflict } from './errors.js'
import { HookConfig } from './hook.js'
import { Method } from './method.js'
import fs from 'fs/promises'
import { getRefUsage } from './lib/get-ref-usage.js'
import setWithPath from './lib/set-with-path.js'

const COLLECTIONS_FILE = 'collections.json'
const HOOKS_FILE = 'hooks.json'
const EDITORS_FILE = 'editors.json'
const SCHEMA_REFS_FILE = 'schema-refs.json'

const MIGRATION_FILENAME_REG = /migration\.\d{4}\.json/

interface Ref {
  name: string
  schema: SchemaDefinitions
}

type Refs = Record<string, Ref>

interface CollectionConfig {
  name: string
  schema: SchemaDefinitions
  /**
   * If `true`, a service will be created for this collection.
   * Default is `true`
   */
  exposed?: boolean
  /**
   * If `true`, this collection will be the schema used to validate
   * fields of other schemas.
   * Default is `false`
   */
  template?: boolean
  indexes: Index[]
  readOnlySchema?: boolean
}

// [ ] Type editor
type Editor = { [key: string]: any }

type HookId = string
type CollectionName = string

type Hooks = {
  after: Record<`${Method}`, [HookId, HookConfig?][]>
  before: Record<`${Method}`, [HookId, HookConfig?][]>
}

class Manifest {
  private collectionsIndex: Record<CollectionName, CollectionConfig> = {}
  private hooksIndex: Record<CollectionName, Hooks> = {}
  private editorsIndex: Record<CollectionName, Editor> = {}
  private refs: Refs = {}

  private initialize: Promise<void>

  constructor() {
    this.initialize = this.load()
  }

  init() {
    return this.initialize
  }

  private async load() {
    const settled = await Promise.allSettled([
      (async () => {
        await this.loadCollections()
        // this depends on collections being loaded
        await this.loadSchemaRefs()
      })(),
      this.loadHooks(),
      this.loadEditors(),
    ])

    for (const result of settled) {
      if (result.status === 'rejected') {
        const err = result.reason
        if (result.reason instanceof Error && err.message.includes('ENOENT')) {
          // Ignore, file doesn't exist
          return
        }

        console.error('[mangobase-core]', err)
      }
    }
  }

  private async loadSchemaRefs() {
    const collections = Object.values(this.collectionsIndex)
    for (const collection of collections) {
      if (collection.template) {
        const name = `collections/${collection.name}`
        this.refs[name] = { name, schema: collection.schema }
      }
    }

    const dir = Manifest.getDirectory()
    const refsJSON = await fs.readFile([dir, SCHEMA_REFS_FILE].join('/'), {
      encoding: 'utf-8',
    })

    const refs = JSON.parse(refsJSON) as Refs

    for (const name in refs) {
      const ref = refs[name]
      this.refs[name] = ref
    }
  }

  private async loadCollections() {
    const dir = Manifest.getDirectory()
    const collectionsJSON = await fs.readFile(
      [dir, COLLECTIONS_FILE].join('/'),
      {
        encoding: 'utf-8',
      }
    )
    this.collectionsIndex = JSON.parse(collectionsJSON)
  }

  private async loadHooks() {
    const dir = Manifest.getDirectory()
    const hooksJSON = await fs.readFile([dir, HOOKS_FILE].join('/'), {
      encoding: 'utf-8',
    })
    this.hooksIndex = JSON.parse(hooksJSON)
  }

  private async loadEditors() {
    const dir = Manifest.getDirectory()
    const editorsJSON = await fs.readFile([dir, EDITORS_FILE].join('/'), {
      encoding: 'utf-8',
    })

    this.editorsIndex = JSON.parse(editorsJSON)
  }

  async setHooks(collection: string, hooks: Hooks) {
    await this.init()
    this.hooksIndex[collection] = hooks

    await this.save()
  }

  async setEditor(collection: string, editor: Editor) {
    await this.init()
    this.editorsIndex[collection] = editor

    await this.save()
  }

  async collection(
    name: string,
    config?: CollectionConfig
  ): Promise<CollectionConfig | undefined> {
    await this.init()

    if (!config) {
      return this.collectionsIndex[name]
    }

    this.collectionsIndex[name] = config
    if (config.template) {
      const refName = `collections/${name}`
      this.refs[refName] = { name: refName, schema: config.schema }
    }

    await this.save()

    return config
  }

  async collections() {
    await this.init()
    return Object.values(this.collectionsIndex)
  }

  async schemaRefs() {
    await this.init()
    return Object.values(this.refs)
  }

  async getHooks(collection: string) {
    await this.init()
    return this.hooksIndex[collection]
  }

  async getEditor(collection: string) {
    await this.init()
    return this.editorsIndex[collection]
  }

  async removeCollection(name: string) {
    await this.init()
    delete this.collectionsIndex[name]
    delete this.hooksIndex[name]
    delete this.editorsIndex[name]
    await this.save()
  }

  async renameCollection(from: string, to: string) {
    if (this.collectionsIndex[to]) {
      throw new Conflict(
        `A collection with name \`${to}\` already exists. Cannot rename \`${from}\` to \`${to}\``
      )
    }

    this.collectionsIndex[to] = this.collectionsIndex[from]
    delete this.collectionsIndex[from]

    this.hooksIndex[to] = this.hooksIndex[from]
    delete this.hooksIndex[from]

    this.editorsIndex[to] = this.editorsIndex[from]
    delete this.editorsIndex[from]

    // rename relations/schemas that make use of collection as a template
    // for collections
    for (const name in this.collectionsIndex) {
      const schema = this.collectionsIndex[name].schema
      const relations = findRelations(schema, from)
      for (const usage of relations) {
        setWithPath(schema, usage, to)
      }

      const references = getRefUsage(`collections/${from}`, schema)
      for (const ref of references) {
        setWithPath(schema, ref, `collections/${to}`)
      }
    }

    // for schema refs
    const previousName = `collections/${from}`
    if (this.getSchemaRef(previousName)) {
      const name = `collections/${to}`
      this.refs[name] = {
        name,
        schema: this.refs[previousName].schema,
      }

      delete this.refs[previousName]

      for (const [name, definition] of Object.entries(this.refs)) {
        if (name.startsWith('collections/')) {
          continue
        }

        const relations = findRelations(definition.schema, previousName)
        for (const usage of relations) {
          setWithPath(definition.schema, usage, name)
        }

        const references = getRefUsage(previousName, definition.schema)
        for (const ref of references) {
          setWithPath(definition.schema, ref, name)
        }
      }
    }

    await this.save()
  }

  async getLastMigrationCommit(): Promise<Migration | null> {
    await this.init()
    const migrationsPath = [Manifest.getDirectory(), 'migrations'].join('/')

    await this.ensureDirectory(migrationsPath)

    const ents = await fs.readdir(migrationsPath, {
      withFileTypes: true,
    })

    let latestMigration: Migration = { id: '', steps: [], version: 0 }

    for (const ent of ents) {
      if (!ent.isFile) {
        continue
      }

      if (MIGRATION_FILENAME_REG.test(ent.name)) {
        const [, versionString] = ent.name.split('.')
        const version = parseInt(versionString, 10)
        if (version > latestMigration.version) {
          const migration = await fs.readFile(
            [migrationsPath, ent.name].join('/'),
            { encoding: 'utf-8' }
          )

          latestMigration = { version, ...JSON.parse(migration) }
        }
      }
    }

    if (latestMigration.version === 0) {
      return null
    }

    return latestMigration
  }

  private async ensureDirectory(migrationsPath: string) {
    try {
      await fs.mkdir(migrationsPath)
    } catch (err) {
      //
    }
  }

  async getMigration(version: number): Promise<Migration> {
    const fn = this.getMigrationFileName(version)
    const json = await fs.readFile(
      [Manifest.getDirectory(), 'migrations', fn].join('/'),
      { encoding: 'utf-8' }
    )

    return JSON.parse(json)
  }

  async commitMigration(migration: Migration) {
    await this.init()

    const dir = [Manifest.getDirectory(), 'migrations'].join('/')
    const fn = this.getMigrationFileName(migration.version)

    await this.ensureDirectory(dir)

    await fs.writeFile(
      [dir, fn].join('/'),
      JSON.stringify(migration, null, 2),
      {
        encoding: 'utf-8',
      }
    )
  }

  async schemaRef(name: string, ref?: Ref): Promise<Ref | undefined> {
    await this.init()
    if (!ref) {
      return this.refs[name]
    }

    this.refs[name] = ref
    await this.save()

    return ref
  }

  async renameSchemaRef(from: string, to: string) {
    if (this.refs[to]) {
      throw new Conflict(
        `A schema ref with name \`${to}\` already exists. Cannot rename \`${from}\` to \`${to}\``
      )
    }

    for (const [, ref] of Object.entries(this.refs)) {
      const usages = getRefUsage(from, ref.schema)
      for (const usage of usages) {
        setWithPath(ref.schema, usage, to)
      }
    }

    for (const [, collection] of Object.entries(this.collectionsIndex)) {
      const usages = getRefUsage(from, collection.schema)
      for (const usage of usages) {
        setWithPath(collection.schema, usage, to)
      }
    }

    this.refs[to] = this.refs[from]
    delete this.refs[from]

    await this.save()
  }

  async getSchemaRefUsages(refName: string) {
    const usages: string[] = []

    const collections = await this.collections()
    for (const collection of collections) {
      if (getRefUsage(refName, collection.schema).length) {
        usages.push(`collections/${collection.name}`)
      }
    }

    for (const ref of Object.values(this.refs)) {
      if (getRefUsage(refName, ref.schema).length) {
        usages.push(ref.name)
      }
    }

    return usages
  }

  private getMigrationFileName(version: number) {
    return `migration.${version.toString().padStart(4, '0')}.json`
  }

  async save() {
    await this.init()
    const dir = Manifest.getDirectory()

    await this.ensureDirectory(dir)

    const dataOuts = [
      [this.collectionsIndex, COLLECTIONS_FILE],
      [this.hooksIndex, HOOKS_FILE],
      [this.editorsIndex, EDITORS_FILE],
    ]

    for (const [index, file] of dataOuts) {
      const data = JSON.stringify(index, undefined, 2)
      await fs.writeFile([dir, file].join('/'), data, {
        encoding: 'utf-8',
      })
    }

    // we don't save the refs with those that come from the collections
    const noCollectionRefs = Object.entries(this.refs).filter(
      ([key]) => !key.startsWith('collections/')
    )

    const refsObject = Object.fromEntries(noCollectionRefs)
    const data = JSON.stringify(refsObject, undefined, 2)
    await fs.writeFile([dir, SCHEMA_REFS_FILE].join('/'), data, {
      encoding: 'utf-8',
    })
  }

  getSchemaRef(name: string) {
    return this.refs[name]
  }

  static getDirectory() {
    return '.mangobase'
  }
}

const HOOKS_STUB: Hooks = {
  after: { create: [], find: [], get: [], patch: [], remove: [] },
  before: { create: [], find: [], get: [], patch: [], remove: [] },
}

export { Manifest }
export { HOOKS_STUB }
export type { CollectionConfig, Hooks as CollectionHooks, Ref }
