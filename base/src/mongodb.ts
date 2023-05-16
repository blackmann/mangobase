import { Cursor, Database } from './database'
import { Db, FindCursor, FindOptions, MongoClient, ObjectId } from 'mongodb'
import { DefinitionType } from './schema'

interface Filters {
  limit?: number
  populate?: string[]
  select?: string[]
  skip?: number
  sort?: Record<string, -1 | 1>
}

class MongoCursor implements Cursor {
  private singleResult = false
  private filters: Filters = {}

  private onExec: ({ projection }: FindOptions) => Promise<FindCursor>

  constructor(
    db: MongoDB,
    onExec: (options: FindOptions) => Promise<FindCursor>
  ) {
    this.onExec = onExec
  }

  populate(fields: string[]): Cursor<any> {
    this.filters.populate = fields
    return this
  }

  select(fields: string[]): Cursor<any> {
    this.filters.select = fields
    return this
  }

  sort(config: Record<string, 1 | -1>): Cursor<any> {
    this.filters.sort = config
    return this
  }

  async exec(): Promise<any> {
    const options: FindOptions = {
      limit: this.filters.limit,
      skip: this.filters.skip,
      sort: this.filters.sort,
    }

    if (this.filters.select?.length) {
      const projection: Record<string, 1> = {}

      for (const key of this.filters.select) {
        projection[key] = 1
      }

      options.projection = projection
    }

    const cursor = await this.onExec(options)

    const results = await cursor.toArray()

    // TODO: handle populate

    if (this.singleResult) {
      return results[0]
    }

    return results
  }

  limit(n: number): Cursor {
    if (n < 1) return this
    this.filters.limit = n

    return this
  }

  skip(n: number): Cursor {
    this.filters.skip = n
    return this
  }

  /**
   * When the result is an array, having called `.single` before `.exec()` will
   * return the first item in the results.
   */
  get single(): MongoCursor {
    this.singleResult = true
    return this
  }
}

class MongoDB implements Database {
  db: Db

  constructor(uri: string, databaseName?: string) {
    const client = new MongoClient(uri)
    this.db = client.db(databaseName)
  }

  cast(value: any, type: DefinitionType) {
    switch (type) {
      case 'id': {
        return ObjectId.createFromHexString(value)
      }

      default:
        return value
    }
  }

  async count(collection: string, query: Record<string, any>): Promise<number> {
    return await this.db.collection(collection).countDocuments(query)
  }

  find(collection: string, query: any): Cursor {
    const col = this.db.collection(collection)
    return new MongoCursor(this, async (options) => col.find(query, options))
  }

  create(collection: string, data: any): Cursor {
    const col = this.db.collection(collection)
    const isMany = Array.isArray(data)

    const cursor = new MongoCursor(this, async (options) => {
      data = isMany ? data : [data]
      const inserted = await col.insertMany(data)
      return col.find(
        { _id: { $in: Object.values(inserted.insertedIds) } },
        options
      )
    })

    return isMany ? cursor : cursor.single
  }

  patch(collection: string, id: string | string[], data: any): Cursor {
    const col = this.db.collection(collection)

    const isMany = Array.isArray(id)
    const ids = isMany ? id : [id]

    const objectIds = ids.map((id) => this.cast(id, 'id'))

    const cursor = new MongoCursor(this, async () => {
      const query = { _id: { $in: objectIds } }
      await col.updateMany(query, { $set: data })
      return col.find(query)
    })

    return isMany ? cursor : cursor.single
  }

  async remove(collection: string, id: string | string[]): Promise<void> {
    const isMany = Array.isArray(id)
    const ids = isMany ? id : [id]

    const objectIds = ids.map((id) => this.cast(id, 'id'))
    const query = { _id: { $in: objectIds } }
    await this.db.collection(collection).deleteMany(query)
  }
}

export { MongoDB, MongoCursor }
