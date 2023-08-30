import { Index, Migration } from './database'
import { SchemaDefinitions, findRelations } from './schema'
import { AppError } from './errors'
import { HookConfig } from './hook'
import Method from './method'
import fs from 'fs/promises'
import setWithPath from './lib/set-with-path'

const COLLECTIONS_FILE = 'collections.json'
const HOOKS_FILE = 'hooks.json'
const EDITORS_FILE = 'editors.json'

const MIGRATION_FILENAME_REG = /migration\.\d{4}\.json/

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

  private initialize: Promise<void>

  constructor() {
    this.initialize = this.load()
  }

  init() {
    return this.initialize
  }

  private async load() {
    try {
      await Promise.allSettled([
        this.loadCollections(),
        this.loadHooks(),
        this.loadEditors(),
      ])
    } catch (err) {
      if (err instanceof Error && err.message.includes('ENOENT')) {
        // Ignore, file doesn't exist
        // [ ] Make resilient, each load, each try
        return
      }

      console.error(err)
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
  ): Promise<CollectionConfig> {
    await this.init()

    if (!config) {
      return this.collectionsIndex[name]
    }

    this.collectionsIndex[name] = config
    await this.save()

    return config
  }

  async collections() {
    await this.init()
    return Object.values(this.collectionsIndex)
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
      throw new Error(
        `A collection with name \`${to}\` already exists. Cannot rename \`${from}\` to \`${to}\``
      )
    }

    this.collectionsIndex[to] = this.collectionsIndex[from]
    delete this.collectionsIndex[from]

    this.hooksIndex[to] = this.hooksIndex[from]
    delete this.hooksIndex[from]

    this.editorsIndex[to] = this.editorsIndex[from]
    delete this.editorsIndex[from]

    for (const name in this.collectionsIndex) {
      const schema = this.collectionsIndex[name].schema
      const usages = findRelations(schema, from)
      for (const usage of usages) {
        setWithPath(schema, [...usage, 'relation'], to)
      }
    }

    await this.save()
  }

  async getLastMigration(): Promise<Migration> {
    const migrationsPath = [Manifest.getDirectory(), 'migrations'].join('/')

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
      throw new AppError('No migrations found')
    }

    return latestMigration
  }

  async commitMigration(migration: Migration) {
    const dir = [Manifest.getDirectory(), 'migrations'].join('/')
    const fn = `migration.${migration.version.toString().padStart(4, '0')}.json`

    try {
      await fs.mkdir(dir)
    } catch (err) {}

    await fs.writeFile(
      [dir, fn].join('/'),
      JSON.stringify(migration, null, 2),
      {
        encoding: 'utf-8',
      }
    )
  }

  async save(env?: string) {
    await this.init()
    const dir = Manifest.getDirectory(env)

    try {
      await fs.mkdir(dir)
    } catch (err) {
      //
    }

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
  }

  static getDirectory(env?: string) {
    return `.mb_${env || process.env.NODE_ENV || 'development'}`
  }
}

const HOOKS_STUB: Hooks = {
  after: { create: [], find: [], get: [], patch: [], remove: [] },
  before: { create: [], find: [], get: [], patch: [], remove: [] },
}

export default Manifest
export { HOOKS_STUB }
export type { CollectionConfig, Hooks as CollectionHooks }
