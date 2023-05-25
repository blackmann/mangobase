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
  private collectionsIndex: Record<string, CollectionConfig> = {}
  private hooksIndex: Record<string, Hooks> = {}

  private initialize: Promise<void>

  constructor() {
    this.initialize = this.load()
  }

  async init() {
    return this.initialize
  }

  private async load() {
    try {
      await Promise.allSettled([this.loadCollections, this.loadHooks])
    } catch (err) {
      if (err instanceof Error && err.message.includes('ENOENT')) {
        // Ignore, file doesn't exist
        // TODO: Make resilient, each load, each try
        return
      }

      console.error(err)
    }
  }

  private async loadCollections() {
    const dir = Manifest.getDirectory()
    const collectionsJSON = await readFile([dir, COLLECTIONS_FILE].join('/'), {
      encoding: 'utf-8',
    })
    this.collectionsIndex = JSON.parse(collectionsJSON)
  }

  private async loadHooks() {
    const dir = Manifest.getDirectory()
    const hooksJSON = await readFile([dir, HOOKS_FILE].join('/'), {
      encoding: 'utf-8',
    })
    this.hooksIndex = JSON.parse(hooksJSON)
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

  async removeCollection(name: string) {
    await this.init()
    delete this.collectionsIndex[name]
    await this.save()
  }

  async save(env?: string) {
    await this.init()
    const dir = Manifest.getDirectory(env)

    try {
      await stat(dir)
    } catch (err) {
      await mkdir(dir)
    }

    const collectionsJson = JSON.stringify(this.collectionsIndex, undefined, 2)
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
