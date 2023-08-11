import App, { Service } from './app'
import { BadRequest, MethodNotAllowed } from './errors'
import Collection, { Filter } from './collection'
import Schema, { ValidationError } from './schema'
import type { Context } from './context'

const ALLOWED_FILTERS = [
  '$limit',
  '$populate',
  '$select',
  '$skip',
  '$sort',
] as const

interface Options {
  schema?: Schema
}

class CollectionService implements Service {
  collection: Collection
  name: string

  constructor(app: App, name: string, { schema }: Options = {}) {
    this.name = name
    this.collection = new Collection(name, {
      db: app.database,
      schema: schema
        ? Promise.resolve(schema)
        : (async () => {
            const { schema } = await app.manifest.collection(name)
            if (!schema) {
              throw new Error(`no collection with \`${name}\` exists`)
            }

            return new Schema(schema, { parser: app.database.cast })
          })(),
    })
  }

  register(app: App, install: (subpath: string) => void) {
    install('')
    install(':id')
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
    if (!ctx.data) {
      throw new ValidationError('[data]', '`data` is required')
    }

    if (ctx.params?.id) {
      throw new MethodNotAllowed('`create` method not allowed on detail path')
    }

    try {
      const result = await this.collection.create(
        ctx.data,
        this.parseQuery(ctx.query).filter
      )

      ctx.result = result

      return ctx
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new BadRequest('Validation failed', {
          detail: err.detail,
          field: err.field,
        })
      }

      throw err
    }
  }

  async find(ctx: Context): Promise<Context> {
    const result = await this.collection.find(this.parseQuery(ctx.query))
    ctx.result = result

    return ctx
  }

  async get(ctx: Context): Promise<Context> {
    const result = await this.collection.get(
      ctx.params!.id,
      this.parseQuery(ctx.query).filter
    )
    ctx.result = result

    return ctx
  }

  async patch(ctx: Context): Promise<Context> {
    if (!ctx.params?.id) {
      throw new MethodNotAllowed('`patch` method not allowed on base path')
    }

    const result = await this.collection.patch(
      ctx.params!.id!,
      ctx.data!,
      this.parseQuery(ctx.query).filter
    )

    if ((Array.isArray(result) && result.length === 0) || !result) {
      // if there's nothing in the result, then the id is invalid and wasn't found
      // this will imply a 404
      return ctx
    }

    ctx.result = result

    return ctx
  }

  // TODO: Allow passing query parameters to remove
  // DELETE /students?name=John
  async remove(ctx: Context): Promise<Context> {
    const result = await this.collection.remove(ctx.params!.id)
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
      if (ALLOWED_FILTERS.includes(key as any)) {
        switch (key) {
          case '$limit': {
            filter.$limit = Math.min(Number(value))
            break
          }

          case '$populate': {
            filter.$populate = Array.isArray(value) ? value : [value]
            break
          }

          case '$select': {
            filter.$select = Array.isArray(value) ? value : [value]
            break
          }

          case '$skip': {
            filter.$skip = Number(value)
            break
          }

          case '$sort': {
            if (typeof value !== 'object') {
              break
            }

            for (const [k, v] of Object.entries(value)) {
              if (v !== '1' && v !== '-1') {
                delete value[k]
                continue
              }
              value[k] = Number(v)
            }

            if (Object.keys(value).length === 0) {
              break
            }

            filter.$sort = value
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
