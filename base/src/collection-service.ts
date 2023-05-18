import Collection, { Filter } from './collection'
import App from './app'
import Context from './context'

const ALLOWED_FILTERS = ['$limit', '$populate', '$select', '$skip', '$sort']

class CollectionService {
  private app: App
  private collection: Collection
  name: string

  constructor(app: App, name: string) {
    this.app = app
    this.name = name
    this.collection = new Collection(name, {
      db: app.database,
      manifest: app.manifest,
    })
  }

  async handle(ctx: Context): Promise<Context> {
    switch (ctx.method) {
      case 'create': {
        return await this.create(ctx)
      }

      case 'find': {
        return await this.find(ctx)
      }

      case 'get': {
        return await this.get(ctx)
      }

      case 'patch': {
        return await this.patch(ctx)
      }

      case 'remove': {
        return await this.remove(ctx)
      }
    }
  }

  async create(ctx: Context): Promise<Context> {
    const result = await this.collection.create(
      ctx.data,
      this.parseQuery(ctx.query).filter
    )
    ctx.result = result

    return ctx
  }

  async find(ctx: Context): Promise<Context> {
    const result = await this.collection.find(this.parseQuery(ctx.query))
    ctx.result = result

    return ctx
  }

  async get(ctx: Context): Promise<Context> {
    const result = await this.collection.get(
      ctx.id!,
      this.parseQuery(ctx.query).filter
    )
    ctx.result = result

    return ctx
  }

  async patch(ctx: Context): Promise<Context> {
    const result = await this.collection.patch(
      ctx.id!,
      ctx.data!,
      this.parseQuery(ctx.query).filter
    )
    ctx.result = result

    return ctx
  }

  // TODO: Allow passing query parameters to remove
  // DELETE /students?name=John
  async remove(ctx: Context): Promise<Context> {
    const result = await this.collection.remove(ctx.id!)
    ctx.result = result

    return ctx
  }

  private parseQuery(query: Record<string, any>): {
    filter: Filter
    query: any
  } {
    const filter: Filter = {}
    const _query: Record<string, any> = {}
    for (const [key, value] of Object.entries(query)) {
      if (ALLOWED_FILTERS.includes(key)) {
        switch (key) {
          case '$limit': {
            filter.$limit = Math.min(Number(value))
            break
          }

          case '$populate': {
            filter.$populate = Array.isArray(value) ? value : [value]
            break
          }
        }
      } else {
        _query[key] = value
      }
    }
    return { filter, query: _query }
  }
}

export default CollectionService
