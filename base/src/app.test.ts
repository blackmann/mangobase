import App, { Service } from './app'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { Database } from './database'
import { context } from './context'

const db = {} as unknown as Database

describe('app', () => {
  describe('use', () => {
    const app = new App({ db })

    it('returns a pipeline [service instance]', () => {
      const service: Service = {
        handle: async (ctx) => ctx,
      }

      const pipeline = app.use('mock-service', service)
      expect(pipeline).toHaveProperty('run')
    })

    it('returns a pipeline [anonymous handler]', () => {
      const pipeline = app.use('mock-handler', async (ctx) => ctx)
      expect(pipeline).toHaveProperty('run')
    })

    it('returns results on successful serve', async () => {
      const service: Service = {
        handle: async (ctx) => ({ ...ctx, result: { _id: 'mock-1' } }),
      }

      app.use('mock-1', service)

      const ctx = await app.serve(context({ path: 'mock-1' }))

      expect(ctx.statusCode).toBe(200)
      expect(ctx.result).toStrictEqual({ _id: 'mock-1' })
    })

    it('returns 404 when no service exists', async () => {
      const ctx = await app.serve(context({ path: 'unknown-1' }))

      expect(ctx.statusCode).toBe(404)
    })
  })
})

describe('pipeline', () => {
  const app = new App({ db })
  const mockHandle = vi.fn(async (ctx) => ctx)
  const service: Service = {
    handle: mockHandle,
  }

  describe('hooks', () => {
    describe('before hooks', () => {
      it('returns internal server error on [unknown] exception', async () => {
        const pipeline = app.use('mock-1', service)

        const firstHook = vi.fn((ctx) => ctx)
        pipeline.before('find', firstHook)
        pipeline.before('find', () => {
          throw new Error('validation maybe')
        })

        const ctx = await pipeline.run(context({}))

        expect(firstHook).toHaveBeenCalled()
        expect(ctx.statusCode).toBe(500)
        expect(ctx.result.error).toBe('Unknown error')
      })

      it('does not call subsequent hooks after result set', async () => {
        const pipeline = app.use('mock-2', service)

        const firstHook = vi.fn((ctx) => ctx)
        const secondHook = vi.fn((ctx) => {
          ctx.result = { _id: 'mock-2' }
          return ctx
        })
        const lastHook = vi.fn()

        pipeline
          .before('find', firstHook)
          .before('find', secondHook)
          .before('find', lastHook)

        const ctx = await pipeline.run(context({}))

        expect(lastHook).not.toHaveBeenCalled()
        expect(firstHook).toHaveBeenCalled()
        expect(secondHook).toHaveBeenCalled()

        expect(ctx.result._id).toBe('mock-2')
      })

      it('returns 404 when no result from service (non-remove method)', async () => {
        const pipeline = app.use('mock-3', service)
        mockHandle.mockImplementation(async (ctx) => ctx)

        const ctx = await pipeline.run(context({}))

        expect(ctx.statusCode).toBe(404)
      })
    })

    describe('after hooks', () => {
      it('returns with error on exception', async () => {
        const pipeline = app.use('mock-4', service)
        mockHandle.mockImplementation(async (ctx) => ({
          ...ctx,
          result: { _id: '123' },
        }))

        pipeline.after('find', async () => {
          throw new Error('effect error')
        })

        const ctx = await pipeline.run(context({}))

        expect(ctx.result.error).toBe('Unknown error')
      })
    })
  })
})

describe('collections service', () => {
  const app = new App({ db })

  describe('when collection is created', () => {
    it('returns with error', async () => {
      const res = await app.serve({
        data: {
          schema: {},
        },
        headers: {},
        locals: {},
        method: 'create',
        path: 'collections',
        query: {},
      })

      expect(res.result.error).toMatch(/name: required/)
    })

    it('returns created collection', async () => {
      const res = await app.serve({
        data: {
          name: 'people',
          schema: {
            age: { type: 'number' },
            name: { type: 'string' },
          },
        },
        headers: {},
        locals: {},
        method: 'create',
        path: 'collections',
        query: {},
      })

      expect(res.data).toStrictEqual({
        name: 'people',
        schema: {
          age: { type: 'number' },
          name: { type: 'string' },
        },
      })
    })
  })

  describe('get collections', () => {
    it('returns saved collections', async () => {
      const res = await app.serve({
        headers: {},
        locals: {},
        method: 'find',
        path: 'collections',
        query: {},
      })

      expect(res.result).toStrictEqual([
        {
          exposed: true,
          name: 'people',
          schema: {
            age: {
              type: 'number',
            },
            name: {
              type: 'string',
            },
          },
          template: false,
        },
      ])
    })
  })

  describe('get collection', () => {
    it('returns collection', async () => {
      const res = await app.serve({
        headers: {},
        locals: {},
        method: 'get',
        path: 'collections/people',
        query: {},
      })

      expect(res.result).toStrictEqual({
        exposed: true,
        name: 'people',
        schema: {
          age: {
            type: 'number',
          },
          name: {
            type: 'string',
          },
        },
        template: false,
      })
    })

    it('returns 404 if not found', async () => {
      const res = await app.serve(
        context({ method: 'get', path: 'collections/persons' })
      )

      expect(res.statusCode).toBe(404)
    })
  })

  describe('patch collection', () => {
    it('updates the collection correctly', async () => {
      const existing = await app.serve(
        context({
          method: 'find', // this will be turned into `get`
          path: 'collections/people',
        })
      )

      expect(existing.result.exposed).toBe(true)

      const res = await app.serve(
        context({
          data: {
            exposed: false,
          },
          method: 'patch',
          path: 'collections/people',
        })
      )

      expect(res.result.exposed).toBe(false)
    })

    it('returns 404 if the collection is not found', async () => {
      const res = await app.serve(
        context({
          data: {
            exposed: false,
          },
          method: 'patch',
          path: 'collections/persons',
        })
      )

      expect(res.statusCode).toBe(404)
    })
  })

  describe('remove collection', () => {
    it('removes collection', async () => {
      const existing = await app.serve(
        context({
          method: 'find',
          path: 'collections',
        })
      )

      expect(existing.result).toHaveLength(1)

      const res = await app.serve(
        context({
          method: 'remove',
          path: 'collections/people',
        })
      )

      expect(res.statusCode).toBe(200)

      const list = await app.serve(context({ path: 'collections' }))

      expect(list.result).toHaveLength(0)
    })
  })

  describe('hooks service', () => {
    beforeAll(() => {
      app.hooksRegistry.register({
        id: 'stash-data',
        name: 'Stash Data',
        run: async (ctx) => {
          ctx.locals.data = ctx.data
          return ctx
        },
      })
    })

    it('list hooks', async () => {
      const res = await app.serve(context({ path: 'hooks-registry' }))
      expect(res.result).toStrictEqual([
        { id: 'stash-data', name: 'Stash Data', run: expect.anything() },
      ])
    })
  })
})
