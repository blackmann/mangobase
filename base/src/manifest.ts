import { mkdir, stat, writeFile } from 'fs/promises'
import { SchemaDefinitions } from './schema'

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

class Manifest {
  collections: Record<string, CollectionConfig> = {}

  async collection(
    name: string,
    config?: CollectionConfig
  ): Promise<CollectionConfig> {
    if (!config) {
      return this.collections[name]
    }

    this.collections[name] = config
    await this.save()

    return config
  }

  async save(env?: string) {
    const dir = Manifest.getDirectory(env)

    try {
      await stat(dir)
    } catch (err) {
      await mkdir(dir)
    }
    const collectionsJson = JSON.stringify(this.collections, undefined, 2)
    await writeFile([dir, 'collections.json'].join('/'), collectionsJson, {
      encoding: 'utf-8',
    })
  }

  static getDirectory(env?: string) {
    return `.mb_${env || process.env.NODE_ENV}`
  }
}

export default Manifest
