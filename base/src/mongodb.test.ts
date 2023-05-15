import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { MongoDB } from './mongodb'
import { ObjectId } from 'mongodb'

describe('mongodb', () => {
  const db = new MongoDB(process.env.MONGO_URL as string)

  describe('cast', () => {
    it('should cast _id to ObjectId', () => {
      const id = db.cast('5f7a6d5a8c9e3f0c1c5d3c8f', 'id')
      expect(id).toBeInstanceOf(ObjectId)
    })
  })

  describe('count', () => {
    afterAll(async () => {
      await db.db.dropCollection('users_count')
    })

    it('should return the number of documents in a collection', async () => {
      const cursor = db.create('users_count', [
        { name: 'John' },
        { name: 'Jane' },
      ])
      await cursor.exec()
      const count = await db.count('users_count', {})
      expect(count).toBe(2)
    })
  })

  describe('find', () => {
    beforeAll(async () => {
      const cursor = db.create('users_find', [
        { name: 'John' },
        { name: 'Jane' },
      ])
      await cursor.exec()
    })

    afterAll(async () => {
      await db.db.dropCollection('users_find')
    })

    it('should returns correct results', async () => {
      const cursor = db.find('users_find', {})
      expect(await cursor.exec()).toStrictEqual([
        { _id: expect.anything(), name: 'John' },
        { _id: expect.anything(), name: 'Jane' },
      ])
    })
  })

  describe('create', () => {
    afterAll(async () => {
      await db.db.dropCollection('users_create')
    })

    it('should create a single document', async () => {
      const cursor = db.create('users_create', { name: 'John' })
      expect(await cursor.exec()).toStrictEqual({
        _id: expect.anything(),
        name: 'John',
      })
    })

    it('should create multiple documents', async () => {
      const cursor = db.create('users_create', [
        { name: 'John' },
        { name: 'Jane' },
      ])
      expect(await cursor.exec()).toStrictEqual([
        { _id: expect.anything(), name: 'John' },
        { _id: expect.anything(), name: 'Jane' },
      ])
    })
  })

  describe('patch', () => {
    let ids: string[] = []

    beforeAll(async () => {
      const cursor = db.create('users_patch', [
        { name: 'John' },
        { name: 'Jane' },
      ])
      ids = (await cursor.exec()).map((user: any) => user._id.toHexString())
    })

    afterAll(async () => {
      await db.db.dropCollection('users_patch')
    })

    it('should patch a single document', async () => {
      const cursor = db.patch('users_patch', ids[0], {
        name: 'John Doe',
      })
      expect(await cursor.exec()).toStrictEqual({
        _id: expect.anything(),
        name: 'John Doe',
      })
    })

    it('should patch multiple documents', async () => {
      const cursor = db.patch('users_patch', ids, {
        name: 'John Doe',
      })
      expect(await cursor.exec()).toStrictEqual([
        { _id: expect.anything(), name: 'John Doe' },
        { _id: expect.anything(), name: 'John Doe' },
      ])
    })
  })

  describe('remove', () => {
    let ids: string[] = []

    beforeAll(async () => {
      const cursor = db.create('users_remove', [
        { name: 'John' },
        { name: 'Jane' },
      ])
      ids = (await cursor.exec()).map((user: any) => user._id.toHexString())
    })

    afterAll(async () => {
      await db.db.dropCollection('users_remove')
    })

    it('should remove a single document', async () => {
      await db.remove('users_remove', ids[0])
      const cursor = db.find('users_remove', {})
      expect(await cursor.exec()).toStrictEqual([
        { _id: expect.anything(), name: 'Jane' },
      ])
    })

    it('should remove multiple documents', async () => {
      await db.remove('users_remove', ids)
      const cursor = db.find('users_remove', {})
      expect(await cursor.exec()).toStrictEqual([])
    })
  })
})
