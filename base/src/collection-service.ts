import { App, type Service } from './app.js'
import { BadRequest, MethodNotAllowed } from './errors.js'
import { Collection, type Filter } from './collection.js'
import { type Definition, Schema, ValidationError } from './schema.js'
import type { Context } from './context.js'

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
  private _collection: Collection
  name: string

  constructor(app: App, name: string, { schema }: Options = {}) {
    this.name = name
    this._collection = new Collection(name, {
      db: app.database,
      schema: schema
        ? Promise.resolve(schema)
        : (async () => {
            const collection = await app.manifest.collection(name)
            if (!collection) {
              throw new Error(`no collection with \`${name}\` exists`)
            }

            return new Schema(collection.schema, {
              getRef: (name) => app.manifest.getSchemaRef(name).schema,
              parser: app.database.cast,
            })
          })(),
    })
  }

  get collection() {
    return this._collection
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
        (
          await this.parseQuery(ctx.query)
        ).filter
      )

      ctx.result = result
      ctx.statusCode = 201

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
    const result = await this.collection.find(await this.parseQuery(ctx.query))
    ctx.result = result

    return ctx
  }

  async get(ctx: Context): Promise<Context> {
    const result = await this.collection.get(
      ctx.params!.id,
      (
        await this.parseQuery(ctx.query)
      ).filter
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
      (
        await this.parseQuery(ctx.query)
      ).filter
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

  private async parseQuery(query: Record<string, any>): Promise<{
    filter: Filter
    query: any
  }> {
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
            const fields = Array.isArray(value) ? value : [value]
            const schema = await this.collection.schema

            filter.$populate = fields.map((field) => {
              const err = new BadRequest(`Cannot populate field \`${field}\``)

              if (!schema) {
                throw err
              }

              const definition = schema.schema[field] as Extract<
                Definition,
                { type: 'id' | 'array' }
              >

              if (!definition || !['id', 'array'].includes(definition.type)) {
                throw err
              }

              if (definition.type === 'id') {
                if (!definition.relation) {
                  throw err
                }

                return { collection: definition.relation, field }
              }

              if (
                // we can't populate tuples
                Array.isArray(definition.items) ||
                definition.items.type !== 'id' ||
                !definition.items.relation
              ) {
                throw err
              }

              return { collection: definition.items.relation, field }
            })

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

export { CollectionService }
