import { afterAll, assert, beforeAll, describe, expect, it } from 'vitest'
import { App } from './app.js'
import { MongoDb } from '@mangobase/mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server-core'
import { context } from './context.js'
import fs from 'fs'

let app: App
let mongod: MongoMemoryServer

async function setup() {
  process.env.SECRET_KEY = 'test'
  mongod = await MongoMemoryServer.create()
  app = new App({
    db: new MongoDb(mongod.getUri('auth-test')),
  })
}

async function teardown() {
  await mongod.stop()
  fs.rmSync('./.mangobase', { force: true, recursive: true })
}

beforeAll(setup, 30_000)
afterAll(teardown)

describe('authentication', () => {
  beforeAll(async () => {
    const { result } = await app.api(
      context({
        data: {
          email: 'mock-1@mail.com',
          fullname: 'Mock User',
          password: 'hello',
          username: 'mock-1',
        },
        method: 'create',
        path: 'users',
      })
    )

    assert(result._id)
  })

  describe('login with username', () => {
    it('should return a token', async () => {
      const { result } = await app.api(
        context({
          data: {
            password: 'hello',
            username: 'mock-1',
          },
          method: 'create',
          path: 'login',
        })
      )

      expect(result.auth.token).toBeDefined()
      expect(result.user).toBeDefined()
    })
  })

  describe('login with email', () => {
    it('should return a token', async () => {
      const { result } = await app.api(
        context({
          data: {
            email: 'mock-1@mail.com',
            password: 'hello',
          },
          method: 'create',
          path: 'login',
        })
      )

      expect(result.auth.token).toBeDefined()
      expect(result.user).toBeDefined()
    })
  })
})
