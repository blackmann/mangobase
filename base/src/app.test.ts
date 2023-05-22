import App, { Service } from './app'
import { describe, expect, it, vi } from 'vitest'
import { Database } from './database'

const db = {} as unknown as Database

describe('app', () => {
  describe('use', () => {
    const app = new App({ db })

    it('returns a pipeline [service instance]', () => {
      const service: Service = {
        handle: async (ctx) => ctx,
        register: () => {
          //
        },
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
        register: (_, install) => {
          install('')
        },
      }

      app.use('mock-1', service)

      const ctx = await app.serve({
        headers: {},
        method: 'find',
        path: 'mock-1',
        query: {},
      })

      expect(ctx.statusCode).toBe(200)
      expect(ctx.result).toStrictEqual({ _id: 'mock-1' })
    })

    it('returns 404 when no service exists', async () => {
      const ctx = await app.serve({
        headers: {},
        method: 'find',
        path: 'unknown-1',
        query: {},
      })

      expect(ctx.statusCode).toBe(404)
    })
  })
})

describe('pipeline', () => {
  const app = new App({ db })
  const mockHandle = vi.fn(async (ctx) => ctx)
  const service: Service = {
    handle: mockHandle,
    register: (_, install) => {
      install('')
    },
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

        const ctx = await pipeline.run({
          headers: {},
          method: 'find',
          path: '',
          query: {},
        })

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

        const ctx = await pipeline.run({
          headers: {},
          method: 'find',
          path: '',
          query: {},
        })

        expect(lastHook).not.toHaveBeenCalled()
        expect(firstHook).toHaveBeenCalled()
        expect(secondHook).toHaveBeenCalled()

        expect(ctx.result._id).toBe('mock-2')
      })

      it('returns 404 when no result from service (non-remove method)', async () => {
        const pipeline = app.use('mock-3', service)
        mockHandle.mockImplementation(async (ctx) => ctx)

        const ctx = await pipeline.run({
          headers: {},
          method: 'find',
          path: '',
          query: {},
        })

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

        const ctx = await pipeline.run({
          headers: {},
          method: 'find',
          path: '',
          query: {},
        })

        expect(ctx.result.error).toBe('Unknown error')
      })
    })
  })
})
