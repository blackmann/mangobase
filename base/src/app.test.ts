import App, { Service } from './app'
import { describe, expect, it } from 'vitest'
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
  })
})

describe('pipeline', () => {
  const app = new App({ db })
  const service: Service = {
    handle: async (ctx) => ctx,
    register: (_, install) => {
      install('')
    },
  }
  const pipeline = app.use('mock', service)

  describe('hooks', () => {
    //
  })
})
