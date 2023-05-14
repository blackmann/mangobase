import { Cursor, Database } from './database'

interface Pagination {
  default: number
  max: number
}

interface Options {
  db: Database
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

class Collection {
  name: string
  db: Database
  pagination: Pagination

  constructor(name: string, options: Options) {
    this.name = name
    this.db = options.db
    this.pagination = options.pagination || DEFAULT_PAGINATION
  }

  async find({ filter, query }: Query) {
    const cursor = this.db.find(this.name, query)
    const cleanedFilter = this.cleanFilter(filter || {})
    this.applyFilter(cursor, cleanedFilter)

    const total = await this.db.count(this.name, query).exec()

    return {
      data: await cursor.exec(),
      limit: cleanedFilter.$limit,
      skip: filter?.$skip || 0,
      total,
    }
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
