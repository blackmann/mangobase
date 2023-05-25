import { mkdir, readFile, stat, writeFile } from 'fs/promises'
import { HookConfig } from './hook'
import Method from './method'
import { SchemaDefinitions } from './schema'

const COLLECTIONS_FILE = 'collections.json'
const HOOKS_FILE = 'hooks.json'

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
}

type HookId = string

type Hooks = {
  after: Record<`${Method}`, [HookId, HookConfig?][]>
  before: Record<`${Method}`, [HookId, HookConfig?][]>
}

class Manifest {
  collections: Record<string, CollectionConfig> = {}
  hooks: Record<string, Hooks> = {}

  private initialize: Promise<void>

  constructor() {
    this.initialize = this.load()
  }

  async init() {
    return this.initialize
  }

  async load() {
    const dir = Manifest.getDirectory()
    try {
      const collectionsJSON = await readFile(
        [dir, COLLECTIONS_FILE].join('/'),
        {
          encoding: 'utf-8',
        }
      )
      this.collections = JSON.parse(collectionsJSON)

      const hooksJSON = await readFile([dir, HOOKS_FILE].join('/'), {
        encoding: 'utf-8',
      })
      this.hooks = JSON.parse(hooksJSON)
    } catch (err) {
      if (err instanceof Error && err.message.includes('ENOENT')) {
        // Ignore, file doesn't exist
        // TODO: Make resilient, each load, each try
      }
    }
  }

  async collection(
    name: string,
    config?: CollectionConfig
  ): Promise<CollectionConfig> {
    await this.init()

    if (!config) {
      return this.collections[name]
    }

    this.collections[name] = config
    await this.save()

    return config
  }

  getHooks(collection: string) {
    return this.hooks[collection]
  }

  async removeCollection(name: string) {
    await this.init()
    delete this.collections[name]
    await this.save()
  }

  async save(env?: string) {
    const dir = Manifest.getDirectory(env)

    try {
      await stat(dir)
    } catch (err) {
      await mkdir(dir)
    }

    const collectionsJson = JSON.stringify(this.collections, undefined, 2)
    await writeFile([dir, COLLECTIONS_FILE].join('/'), collectionsJson, {
      encoding: 'utf-8',
    })
  }

  static getDirectory(env?: string) {
    return `.mb_${env || process.env.NODE_ENV}`
  }
}

export default Manifest
export type { CollectionConfig }
