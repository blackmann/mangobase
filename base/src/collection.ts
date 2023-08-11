import { Cursor, Database } from './database'
import Schema from './schema'

interface Pagination {
  default: number
  max: number
}

interface Options {
  db: Database
  schema: Promise<Schema>
  pagination?: Pagination
}

type FilterOperators = '$limit' | '$populate' | '$select' | '$skip' | '$sort'

type Filter = {
  $limit?: number
  $populate?: string[]
  $select?: string[]
  $skip?: number
  $sort?: Record<string, -1 | 1>
}

interface Query {
  /** This is used to narrow selections */
  filter?: Filter
  /** This is used to make selections */
  query?: any
}

const DEFAULT_PAGINATION: Pagination = {
  default: 50,
  max: 100,
}

type Data = Record<string, any>

class Collection {
  name: string
  db: Database
  pagination: Pagination

  schema: Promise<Schema>

  constructor(name: string, options: Options) {
    this.name = name
    this.db = options.db
    this.pagination = options.pagination || DEFAULT_PAGINATION
    this.schema = options.schema
  }

  async create(data: Data | Data[], filter: Filter = {}) {
    const timestamps = {
      created_at: this.db.cast(new Date(), 'date'),
      updated_at: this.db.cast(new Date(), 'date'),
    }

    const validatedData = Array.isArray(data)
      ? await Promise.all(
          data.map(async (item) => {
            const validated = (await this.schema).validate(item)
            return { ...validated, ...timestamps }
          })
        )
      : { ...(await this.schema).validate(data, true), ...timestamps }

    const cursor = this.db.create(this.name, validatedData)
    const allowedFilters: Filter = {
      $populate: filter.$populate,
      $select: filter.$select,
    }

    this.applyFilter(cursor, allowedFilters)

    const results = await cursor.exec()
    return results
  }

  async find({ filter, query }: Query) {
    query = (await this.schema).castQuery(query || {})
    filter = this.cleanFilter(filter || {})

    const cursor = this.db.find(this.name, query)
    this.applyFilter(cursor, filter)

    const total = await this.db.count(this.name, query)

    return {
      data: await cursor.exec(),
      limit: filter.$limit,
      skip: filter?.$skip || 0,
      total,
    }
  }

  async get(id: string, filter: Filter = {}) {
    const cursor = this.db.find(this.name, { _id: this.db.cast(id, 'id') })
    const allowedFilters: Filter = {
      $limit: 1,
      $populate: filter.$populate,
      $select: filter.$select,
    }

    this.applyFilter(cursor, allowedFilters)

    const [result] = await cursor.exec()

    return result
  }

  async remove(id: string | string[]) {
    return await this.db.remove(this.name, id)
  }

  async patch(id: string | string[], data: Data, filter: Filter) {
    data = (await this.schema).validate(data, false, true)

    const allowedFilters: Filter = {
      $populate: filter.$populate,
      $select: filter.$select,
    }

    const cursor = this.db.patch(this.name, id, {
      ...data,
      updated_at: this.db.cast(new Date(), 'date'),
    })
    this.applyFilter(cursor, allowedFilters)

    const results = await cursor.exec()

    return results
  }

  private applyFilter(cursor: Cursor, filter: Filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined) {
        continue
      }

      switch (key) {
        case '$limit': {
          cursor.limit(value as number)
          break
        }

        case '$populate': {
          cursor.populate(value as string[])
          break
        }

        case '$select': {
          cursor.select(value as string[])
          break
        }

        case '$skip': {
          cursor.skip(value as number)
          break
        }

        case '$sort': {
          cursor.sort(value as Record<string, -1 | 1>)
          break
        }
      }
    }
  }

  private cleanFilter({ $limit, ...filter }: Filter) {
    const limit = Math.min(
      this.pagination.max,
      $limit || this.pagination.default
    )

    return { ...filter, $limit: limit }
  }
}

export default Collection

export type { Filter, FilterOperators, Query }
