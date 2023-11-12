import type {
  Cursor,
  Database,
  DatabaseFilter,
  DefinitionType,
  Index,
  Migration,
} from 'mangobase'
import {
  Db,
  FindCursor,
  FindOptions,
  MongoBulkWriteError,
  MongoClient,
  ObjectId,
} from 'mongodb'
import { errors } from 'mangobase'

interface Filters {
  limit?: number
  populate?: (string | { collection: string; field: string })[]
  select?: string[]
  skip?: number
  sort?: Record<string, -1 | 1>
}

class MongoCursor implements Cursor {
  db: MongoDb
  private singleResult = false
  private filters: Filters = {}

  private onExec: ({ projection }: FindOptions) => Promise<FindCursor>

  constructor(
    db: MongoDb,
    onExec: (options: FindOptions) => Promise<FindCursor>
  ) {
    this.db = db
    this.onExec = onExec
  }

  select(fields: string[]): Cursor<any> {
    this.filters.select = fields
    return this
  }

  sort(config: Record<string, 1 | -1>): Cursor<any> {
    this.filters.sort = config
    return this
  }

  /**
   * Populate a field with data from another collection. When a string is used, the value
   * will be populated from the collection with same name. When an object is used, the value
   * will be populated from the collection with the name specified in the `collection` property.
   *
   * Population is a complex operation and less performant with nested fields.
   */
  populate(
    fields: (string | { collection: string; field: string })[]
  ): Cursor<any> {
    this.filters.populate = fields
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

    // [ ] take care of nested select fields
    for (const field of this.filters.populate || []) {
      const [collection, fieldToPopulate] =
        typeof field === 'string'
          ? [field, field]
          : [field.collection, field.field]

      const fieldPath = fieldToPopulate.split('.')

      const ids = results
        .map((result: any) => {
          let value = result

          for (const key of fieldPath) {
            value = value[key]
          }

          return value
        })
        .filter(Boolean)

      if (!ids.length) continue

      const query = { _id: { $in: ids } }
      const populationResults = await this.db.find(collection, query).exec()

      const resultsIndex: Record<string, any> = {}
      for (const item of populationResults) {
        resultsIndex[item._id.toHexString()] = item
      }

      for (const result of results) {
        let i = 0

        let objectToPopulate = result
        while (i < fieldPath.length - 1) {
          objectToPopulate = objectToPopulate[fieldPath[i]]
          i++
        }

        const field = fieldPath[i]
        const id = objectToPopulate[field]

        if (!id) {
          continue
        }
        if (Array.isArray(id)) {
          objectToPopulate[field] = populationResults.filter((r: any) =>
            id.map((i) => i.toHexString()).includes(r._id.toHexString())
          )
        } else {
          objectToPopulate[field] = resultsIndex[id.toHexString()] || id
        }
      }
    }

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

class MongoDb implements Database {
  db: Db

  constructor(uri: string, databaseName?: string) {
    const client = new MongoClient(uri)
    this.db = client.db(databaseName)
  }

  cast(value: any, type: DefinitionType) {
    switch (type) {
      case 'id': {
        if (typeof value !== 'string') {
          return value
        }

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
      try {
        const inserted = await col.insertMany(data)
        return col.find(
          { _id: { $in: Object.values(inserted.insertedIds) } },
          options
        )
      } catch (error) {
        if (error instanceof MongoBulkWriteError) {
          if (error.code === 11000) {
            throw new errors.Conflict(error.message)
          }
        }

        throw error
      }
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

  async migrate(migration: Migration): Promise<void> {
    for (const step of migration.steps) {
      switch (step.type) {
        case 'add-field': {
          // we'll only care about unique fields for now
          if (step.definition.unique) {
            await this.addIndexes(step.collection, [
              {
                fields: [[step.name, 1]],
                options: { unique: true },
              },
            ])
          }
          break
        }

        case 'create-collection': {
          const uniqueIndexes: Index[] = []
          for (const [fieldName, definition] of Object.entries(
            step.collection.schema
          )) {
            if (definition.unique) {
              uniqueIndexes.push({
                fields: [[fieldName, 1]],
                options: { unique: true },
              })
            }
          }

          await this.addIndexes(step.name, uniqueIndexes)
          await this.addIndexes(step.name, step.collection.indexes)
          break
        }

        case 'rename-collection': {
          await this.db.collection(step.collection).rename(step.to)

          break
        }

        case 'rename-field': {
          await this.db
            .collection(step.collection)
            .updateMany({}, { $rename: { [step.from]: step.to } })

          // [ ] Update index to match; maybe it should be called from app-level?
          break
        }

        case 'remove-field': {
          await this.db
            .collection(step.collection)
            .updateMany({}, { $unset: { [step.field]: '' } })

          break
        }

        case 'update-constraints': {
          if (step.constraints.unique) {
            await this.addIndexes(step.collection, [
              { fields: [step.field], options: { unique: true } },
            ])
          } else {
            await this.removeIndexes(step.collection, [
              { fields: [step.field] },
            ])
          }

          break
        }

        case 'add-index': {
          await this.addIndexes(step.collection, [step.index])
          break
        }

        case 'remove-index': {
          await this.removeIndexes(step.collection, [step.index])
          break
        }
      }
    }
  }

  private async checkCollectionExists(collection: string) {
    const exists = await this.db.listCollections({ name: collection }).toArray()
    if (!exists.length) {
      await this.db.createCollection(collection)
    }
  }

  async addIndexes(collection: string, indexes: Index[]): Promise<void> {
    await this.checkCollectionExists(collection)

    for (const index of indexes) {
      await this.db.createIndex(collection, index.fields, index.options)
    }
  }

  async removeIndexes(collection: string, indexes: Index[]): Promise<void> {
    await this.checkCollectionExists(collection)

    const indexDoc = Object.fromEntries(
      indexes
        .map(({ fields }) =>
          fields.map((field) =>
            typeof field === 'string' ? [field, 1] : field
          )
        )
        .flat()
    )

    await this.db.collection(collection).dropIndex(indexDoc)
  }

  // [ ] Properly type these args/design this API
  async aggregate(
    collection: string,
    query: Record<string, any>,
    filter: DatabaseFilter,
    operations: Record<string, any>[]
  ) {
    const pipeline: Record<string, any> = [
      {
        $match: query,
      },
    ]

    if (filter.sort) {
      pipeline.push({ $sort: filter.sort })
    }

    if (filter.skip) {
      pipeline.push({ $skip: filter.skip })
    }

    if (filter.limit) {
      pipeline.push({ $limit: filter.limit })
    }

    pipeline.push(...operations)

    const res = await this.db
      .collection(collection)
      .aggregate(pipeline as Document[])
      .toArray()

    return res
  }
}

export { MongoDb, MongoCursor }
