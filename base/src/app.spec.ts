import { afterAll, assert, beforeAll, describe, expect, it } from 'vitest'
import { App } from './app.js'
import { MongoDb } from '@mangobase/mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server-core'
import { Ref } from './manifest.js'
import { context } from './context.js'
import fs from 'fs'
import { onDev } from './lib/api-paths.js'

let app: App
let mongod: MongoMemoryServer
let devAuthToken: string

async function setup() {
  process.env.SECRET_KEY = 'test'
  mongod = await MongoMemoryServer.create()
  app = new App({
    db: new MongoDb(mongod.getUri('test')),
  })
}

async function teardown() {
  await mongod.stop()
  fs.rmSync('./.mangobase', { force: true, recursive: true })
}

beforeAll(setup, 30_000)
afterAll(teardown)

describe('setup', () => {
  describe('dev-setup', () => {
    beforeAll(async () => {
      // this user doesn't have the role: `dev` so checking for dev-setup should return false
      const { statusCode } = await app.api(
        context({
          data: {
            email: 'mock-11@mail.com',
            fullname: 'Mock User',
            password: 'helloworld',
            username: 'mock-1',
          },
          method: 'create',
          path: 'users',
        })
      )

      assert(statusCode === 201)
    })

    it('returns false on initial setup', async () => {
      const res = await app.api(context({ path: '_dev/dev-setup' }))

      // should be false because no dev is added yet
      expect(res.result).toBe(false)
    })
  })

  describe('admin/dev setup', () => {
    afterAll(async () => {
      const res = await app.api(
        context({
          data: {
            password: 'helloworld',
            username: 'mock',
          },
          method: 'create',
          path: 'login',
        })
      )

      devAuthToken = res.result.auth.token
    })

    it('returns user after creating one', async () => {
      const res = await app.api(
        context({
          data: {
            email: 'mock-1@mail.com',
            fullname: 'Mock User',
            password: 'helloworld',
            role: 'dev',
            username: 'mock',
          },
          method: 'create',
          path: 'users',
        })
      )

      expect(res.result).toStrictEqual({
        _id: expect.anything(),
        created_at: expect.any(Date),
        email: 'mock-1@mail.com',
        fullname: 'Mock User',
        role: 'dev',
        updated_at: expect.any(Date),
        username: 'mock',
      })
    })

    it('returns true for dev-setup', async () => {
      const res = await app.api(context({ path: '_dev/dev-setup' }))
      expect(res.result).toBe(true)
    })
  })
})

describe('collections', () => {
  beforeAll(async () => {
    // add new collection
    await app.api(
      context({
        data: {
          name: 'mock-collection-control',
          schema: {
            name: { type: 'string' },
          },
        },
        headers: {
          authorization: `Bearer ${devAuthToken}`,
        },
        method: 'create',
        path: 'collections',
      })
    )

    await app.api(
      context({
        data: {
          name: 'mock-collection-control-child',
          schema: {
            name: { type: 'string' },
            parent: { relation: 'mock-collection-control', type: 'id' },
          },
        },
        headers: {
          authorization: `Bearer ${devAuthToken}`,
        },
        method: 'create',
        path: 'collections',
      })
    )
  })

  describe('add collection', () => {
    it('returns created collection', async () => {
      const res = await app.api(
        context({
          data: {
            name: 'mock-collection',
            schema: {
              name: { type: 'string' },
            },
          },
          headers: {
            authorization: `Bearer ${devAuthToken}`,
          },
          method: 'create',
          path: 'collections',
        })
      )

      expect(res.statusCode).toBe(201)
      expect(res.result).toStrictEqual({
        exposed: true,
        indexes: [],
        name: 'mock-collection',
        schema: {
          name: { type: 'string' },
        },
        template: false,
      })
    })

    it('returns created collection [template=true]', async () => {
      const res = await app.api(
        context({
          data: {
            name: 'mock-template-collection',
            schema: {
              name: { type: 'string' },
            },
            template: true,
          },
          headers: {
            authorization: `Bearer ${devAuthToken}`,
          },
          method: 'create',
          path: 'collections',
        })
      )

      // template usage
      await app.api(
        context({
          data: {
            name: 'mock-template-usage-collection',
            schema: {
              name: {
                schema: 'collections/mock-template-collection',
                type: 'object',
              },
            },
          },
          headers: {
            authorization: `Bearer ${devAuthToken}`,
          },
          method: 'create',
          path: 'collections',
        })
      )

      expect(res.statusCode).toBe(201)

      const templateRefs = await app.api(
        context({
          headers: {
            authorization: `Bearer ${devAuthToken}`,
          },
          method: 'find',
          path: onDev('schema-refs'),
        })
      )

      expect(templateRefs.result).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'collections/mock-template-collection',
          }),
        ])
      )
    })

    it('returns conflict when collection already exists', async () => {
      const res = await app.api(
        context({
          data: {
            name: 'mock-collection',
            schema: {
              name: { type: 'string' },
            },
          },
          headers: {
            authorization: `Bearer ${devAuthToken}`,
          },
          method: 'create',
          path: 'collections',
        })
      )

      expect(res.statusCode).toBe(409)
    })

    it('returns methodnotallowed when id is passed', async () => {
      const res = await app.api(
        context({
          data: {
            name: 'mock-collection',
            schema: {
              name: { type: 'string' },
            },
          },
          headers: {
            authorization: `Bearer ${devAuthToken}`,
          },
          method: 'create',
          path: 'collections/mock-collection',
        })
      )

      expect(res.statusCode).toBe(405)
    })
  })

  describe('list collections', () => {
    it('returns unauthorized without auth', async () => {
      const res = await app.api(
        context({
          path: 'collections',
        })
      )

      expect(res.statusCode).toBe(401)
    })

    it('returns created collections', async () => {
      const res = await app.api(
        context({
          headers: { authorization: `Bearer ${devAuthToken}` },
          path: 'collections',
        })
      )

      expect(res.statusCode).toBe(200)

      const expectedCollections = [
        '_migrations',
        'auth-credentials',
        'mock-collection',
        'mock-collection-control',
        'mock-collection-control-child',
        'mock-template-collection',
        'mock-template-usage-collection',
        'users',
      ]

      expect(res.result).toHaveLength(expectedCollections.length)

      expect(res.result).toStrictEqual(
        expectedCollections.map((collection) =>
          expect.objectContaining({ name: collection })
        )
      )
    })
  })

  describe('edit collection', () => {
    const patchData = {
      migrationSteps: [],
      name: 'mock-collection',
      schema: {
        age: { type: 'number' },
        name: { required: true, type: 'string' },
      },
    }

    it('returns unauthorized without auth', async () => {
      const res = await app.api(
        context({
          data: patchData,
          method: 'patch',
          path: 'collections/mock-collection',
        })
      )

      expect(res.statusCode).toBe(401)
    })

    it('returns updated collection', async () => {
      const res = await app.api(
        context({
          data: patchData,
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'patch',
          path: 'collections/mock-collection',
        })
      )

      expect(res.statusCode).toBe(200)
      expect(res.result).toStrictEqual({
        exposed: true,
        indexes: [],
        name: 'mock-collection',
        schema: {
          age: { type: 'number' },
          name: { required: true, type: 'string' },
        },
        template: false,
      })
    })

    it('returns 404 on patch when collection does not exist', async () => {
      const res = await app.api(
        context({
          data: patchData,
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'patch',
          path: 'collections/mock-collection-2',
        })
      )

      expect(res.statusCode).toBe(404)
    })

    it('returns methodnotallowed on patch when no id is passed', async () => {
      const res = await app.api(
        context({
          data: patchData,
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'patch',
          path: 'collections',
        })
      )

      expect(res.statusCode).toBe(405)
    })

    it('returns conflict when collection already exists', async () => {
      const res = await app.api(
        context({
          data: { ...patchData, name: 'mock-collection-control' },
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'patch',
          path: 'collections/mock-collection',
        })
      )

      expect(res.statusCode).toBe(409)
    })

    it('updates other collection relations on rename', async () => {
      const res = await app.api(
        context({
          data: {
            migrationSteps: [
              {
                collection: 'mock-collection-control',
                to: 'mock-collection-renamed',
                type: 'rename-collection',
              },
            ],
            name: 'mock-collection-renamed',
          },
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'patch',
          path: 'collections/mock-collection-control',
        })
      )

      expect(res.result?.name).toBe('mock-collection-renamed')

      const relatedCollection = await app.api(
        context({
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'get',
          path: 'collections/mock-collection-control-child',
        })
      )

      expect(relatedCollection.result.schema.parent.relation).toBe(
        'mock-collection-renamed'
      )
    })

    it('updates fields using collection as template', async () => {
      await app.api(
        context({
          data: {
            migrationSteps: [
              {
                collection: 'mock-template-collection',
                to: 'mock-template-collection-renamed',
                type: 'rename-collection',
              },
            ],
            name: 'mock-template-collection-renamed',
          },
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'patch',
          path: 'collections/mock-template-collection',
        })
      )

      const updatedUsage = await app.api(
        context({
          headers: { authorization: `Bearer ${devAuthToken}` },
          path: 'collections/mock-template-usage-collection',
        })
      )

      expect(updatedUsage.result).toStrictEqual(
        expect.objectContaining({
          schema: expect.objectContaining({
            name: {
              schema: 'collections/mock-template-collection-renamed',
              type: 'object',
            },
          }),
        })
      )

      const updatedRefs = await app.api(
        context({
          headers: { authorization: `Bearer ${devAuthToken}` },
          path: onDev('schema-refs'),
        })
      )

      const refs = updatedRefs.result.filter((schema: Ref) =>
        schema.name.startsWith('collections/')
      )

      expect(refs).toStrictEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            name: 'collections/mock-template-collection',
          }),
        ])
      )

      expect(refs).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'collections/mock-template-collection-renamed',
          }),
        ])
      )
    })
  })

  describe('get a collection', () => {
    it('returns collection without auth', async () => {
      const res = await app.api(
        context({
          path: 'collections/mock-collection',
        })
      )

      expect(res.statusCode).toBe(200)
      expect(res.result).toStrictEqual({
        exposed: true,
        indexes: [],
        name: 'mock-collection',
        schema: {
          age: { type: 'number' },
          name: { required: true, type: 'string' },
        },
        template: false,
      })
    })

    it('returns collection', async () => {
      const res = await app.api(
        context({
          headers: { authorization: `Bearer ${devAuthToken}` },
          path: 'collections/mock-collection',
        })
      )

      expect(res.statusCode).toBe(200)
      expect(res.result).toStrictEqual({
        exposed: true,
        indexes: [],
        name: 'mock-collection',
        schema: {
          age: { type: 'number' },
          name: { required: true, type: 'string' },
        },
        template: false,
      })
    })

    it('returns 404 when collection does not exist', async () => {
      const res = await app.api(
        context({
          headers: { authorization: `Bearer ${devAuthToken}` },
          path: 'collections/mock-collection-2',
        })
      )

      expect(res.statusCode).toBe(404)
    })
  })

  describe('delete a collection', () => {
    it('returns unauthorized without auth', async () => {
      const res = await app.api(
        context({
          method: 'remove',
          path: 'collections/mock-collection',
        })
      )

      expect(res.statusCode).toBe(401)
    })

    it('returns 405 when no id is passed', async () => {
      const res = await app.api(
        context({
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'remove',
          path: 'collections',
        })
      )

      expect(res.statusCode).toBe(405)
    })

    // [ ] Throw error when collection is used as a relation in other collections

    it('returns 200 when collection is deleted', async () => {
      const res = await app.api(
        context({
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'remove',
          path: 'collections/mock-collection',
        })
      )

      expect(res.statusCode).toBe(200)
    })
  })
})

describe('collection service', () => {
  beforeAll(async () => {
    await app.api(
      context({
        data: {
          name: 'albums',
          schema: {
            streams: { defaultValue: 0, type: 'number' },
            title: { required: true, type: 'string' },
          },
        },
        headers: { authorization: `Bearer ${devAuthToken}` },
        method: 'create',
        path: 'collections',
      })
    )

    await app.api(
      context({
        data: {
          name: 'songs',
          schema: {
            album: { relation: 'album', required: true, type: 'id' },
            title: { required: true, type: 'string' },
          },
        },
        headers: { authorization: `Bearer ${devAuthToken}` },
        method: 'create',
        path: 'collections',
      })
    )
  })

  it('returns created album', async () => {
    const res = await app.api(
      context({
        data: {
          streams: 0,
          title: 'Mock Album',
        },
        method: 'create',
        path: 'albums',
      })
    )

    expect(res.statusCode).toBe(201)
    expect(res.result).toStrictEqual({
      _id: expect.anything(),
      created_at: expect.any(Date),
      streams: 0,
      title: 'Mock Album',
      updated_at: expect.any(Date),
    })
  })

  it('returns 400 when wrong data is passed', async () => {
    const res = await app.api(
      context({
        data: {
          streams: 0,
        },
        method: 'create',
        path: 'albums',
      })
    )

    expect(res.statusCode).toBe(400)
  })

  it('returns all created items', async () => {
    const res = await app.api(
      context({
        path: 'albums',
      })
    )

    expect(res.result.data.length).toBe(1)
    expect(res.result.total).toBe(1)
  })

  it('returns one item on get', async () => {
    const res = await app.api(context({ path: 'albums' }))
    const [album] = res.result.data

    const albumRes = await app.api(
      context({
        path: `albums/${album._id}`,
      })
    )

    expect(albumRes.statusCode).toBe(200)
    expect(albumRes.result).toStrictEqual(album)
  })

  it('returns 404 if not found', async () => {
    const res = await app.api(
      context({
        path: 'albums/123456789012345678901234',
      })
    )

    expect(res.statusCode).toBe(404)
  })

  it('returns patched item', async () => {
    const res = await app.api(context({ path: 'albums' }))
    const [album] = res.result.data

    const albumRes = await app.api(
      context({
        data: {
          streams: 100,
        },
        method: 'patch',
        path: `albums/${album._id}`,
      })
    )

    expect(albumRes.statusCode).toBe(200)
    expect(albumRes.result).toStrictEqual({
      _id: expect.anything(),
      created_at: expect.any(Date),
      streams: 100,
      title: 'Mock Album',
      updated_at: expect.any(Date),
    })
  })

  it('returns methodnotallowed if no id is passed for patch', async () => {
    const res = await app.api(
      context({
        data: {
          streams: 100,
        },
        method: 'patch',
        path: `albums`,
      })
    )

    expect(res.statusCode).toBe(405)
  })

  it('returns 404 if item to patch is not found', async () => {
    const res = await app.api(
      context({
        data: {
          streams: 100,
        },
        method: 'patch',
        path: `albums/123456789012345678901234`,
      })
    )

    expect(res.statusCode).toBe(404)
  })

  it('removes item', async () => {
    const res = await app.api(context({ path: 'albums' }))
    const [album] = res.result.data

    const albumRes = await app.api(
      context({
        method: 'remove',
        path: `albums/${album._id}`,
      })
    )

    expect(albumRes.statusCode).toBe(200)

    const noRes = await app.api(
      context({
        path: `albums/${album._id}`,
      })
    )

    expect(noRes.statusCode).toBe(404)
  })

  it('returns validation error if data is not passed for create', async () => {
    const res = await app.api(
      context({
        method: 'create',
        path: 'albums',
      })
    )

    expect(res.statusCode).toBe(400)
    expect(res.result).toStrictEqual({
      details: '`data` is required',
      error: '[data]: `data` is required',
    })
  })

  it('returns an error if an id param is passed for create', async () => {
    const res = await app.api(
      context({
        data: {
          streams: 0,
          title: 'Mock Album',
        },
        method: 'create',
        path: 'albums/123456789012345678901234',
      })
    )

    expect(res.statusCode).toBe(405)
    expect(res.result).toStrictEqual({
      details: undefined,
      error: '`create` method not allowed on detail path',
    })
  })

  describe('relations', () => {
    beforeAll(async () => {
      const { statusCode } = await app.api(
        context({
          data: {
            name: 'discography',
            schema: {
              songs: {
                items: { relation: 'songs', type: 'id' },
                type: 'array',
              },
              year: { required: true, type: 'number' },
            },
          },
          headers: { authorization: `Bearer ${devAuthToken}` },
          method: 'create',
          path: 'collections',
        })
      )

      assert(statusCode === 201)

      const { result: album } = await app.api(
        context({
          data: {
            streams: 0,
            title: 'Mock Album',
          },
          method: 'create',
          path: 'albums',
        })
      )

      const { result: song } = await app.api(
        context({
          data: {
            album: album._id,
            title: 'Mock Song 2',
          },
          method: 'create',
          path: 'songs',
        })
      )

      await app.api(
        context({
          data: {
            songs: [song._id],
            year: 2024,
          },
          method: 'create',
          path: 'discography',
        })
      )
    })

    describe('$populate', () => {
      it('returns populated data', async () => {
        const { result } = await app.api(
          context({ path: 'discography', query: { $populate: 'songs' } })
        )

        expect(result.data[0].songs[0]).toStrictEqual(
          expect.objectContaining({
            title: 'Mock Song 2',
          })
        )
      })
    })
  })
})

describe.todo('authentication')
describe.todo('editor')

describe('hooks registry', () => {
  it('returns official hooks', async () => {
    const res = await app.api(
      context({
        headers: { authorization: `Bearer ${devAuthToken}` },
        path: '_dev/hooks-registry',
      })
    )

    const expectedHooks = [
      'log-data',
      'custom-code',
      'restrict-method',
      'auth-collect-password',
      'create-auth-credential',
      'require-auth',
      'assign-auth-user',
    ]

    expect(res.result).toStrictEqual(
      expect.arrayContaining(
        expectedHooks.map((hook) => expect.objectContaining({ id: hook }))
      )
    )
  })
})

describe('users/auth service', () => {
  it('creates user', async () => {
    const res = await app.api(
      context({
        data: {
          email: 'mockusers1@mail.com',
          fullname: 'Mock User',
          password: 'helloworld',
          username: 'mock-user-1',
        },
        method: 'create',
        path: 'users',
      })
    )

    expect(res.statusCode).toBe(201)
    expect(res.result).toStrictEqual({
      _id: expect.anything(),
      created_at: expect.any(Date),
      email: 'mockusers1@mail.com',
      fullname: 'Mock User',
      role: 'basic',
      updated_at: expect.any(Date),
      username: 'mock-user-1',
    })
  })

  it('returns 400 when password is less than 8 characters', async () => {
    const res = await app.api(
      context({
        data: {
          email: 'mockuser2@mail.com',
          fullname: 'Mock User',
          password: 'hello',
          username: 'mock-user-2',
        },
        method: 'create',
        path: 'users',
      })
    )

    expect(res.statusCode).toBe(400)
    expect(res.result.error).toStrictEqual(
      '`password` should be at least 8 characters long'
    )
  })

  it('should create user without requiring password', async () => {
    const res = await app.api(
      context({
        data: {
          email: 'mockusers3@mail.com',
          fullname: 'Mock User',
          username: 'mock-user-3',
        },
        method: 'create',
        path: 'users',
      })
    )

    expect(res.statusCode).toBe(201)
  })
})
