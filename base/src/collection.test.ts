import { Cursor, Database } from './database'
import { describe, expect, it, vi } from 'vitest'
import Collection from './collection'
import { MockedObject } from 'vitest'
import Manifest from './manifest'

function getCursor() {
  const mockCursor: MockedObject<Cursor> = {
    exec: vi.fn(),
    limit: vi.fn(),
    populate: vi.fn(),
    select: vi.fn(),
    skip: vi.fn(),
    sort: vi.fn(),
  }

  return mockCursor
}
type Data = Record<string, any>
const mockDb: MockedObject<Database> = {
  cast: vi.fn((value, type) => {
    if (type === 'id') return Number(value)
    return value
  }),
  count: vi.fn(),
  create: vi.fn<[string, Data], Cursor<any>>(),
  find: vi.fn<[string, Data], Cursor<any>>(),
  patch: vi.fn<[string, string | string[], Data], Cursor<any>>(),
  remove: vi.fn(),
}

const mockManifest: MockedObject<Manifest> = {
  getSchema: vi.fn(async (n: string) => ({
    age: { type: 'number' },
    name: { required: true, type: 'string' },
  })),
  initialize: new Promise(() => {}),
}

describe('collections', () => {
  const collection = new Collection('mock', {
    db: mockDb,
    manifest: mockManifest,
  })

  describe('find', () => {
    it('returns results if there is', async () => {
      const findCursor = getCursor()
      mockDb.find.mockReturnValue(findCursor)
      findCursor.exec.mockResolvedValue([])

      mockDb.count.mockResolvedValue(10)

      const results = await collection.find({})
      expect(results).toStrictEqual({ data: [], limit: 50, skip: 0, total: 10 })
    })

    it('applies filters', async () => {
      const findCursor = getCursor()
      mockDb.find.mockReturnValue(findCursor)

      await collection.find({
        filter: {
          $limit: 10,
          $populate: ['user'],
          $select: ['user'],
          $skip: 5,
          $sort: { createdAt: -1 },
        },
      })

      expect(findCursor.limit).toHaveBeenCalledWith(10)
      expect(findCursor.skip).toHaveBeenCalledWith(5)
      expect(findCursor.populate).toHaveBeenCalledWith(['user'])
      expect(findCursor.select).toHaveBeenCalledWith(['user'])
      expect(findCursor.sort).toHaveBeenCalledWith({ createdAt: -1 })
    })

    it('applies query [casted]', async () => {
      const findCursor = getCursor()
      mockDb.find.mockReturnValue(findCursor)

      await collection.find({
        query: { age: '10' },
      })

      expect(mockDb.find).toHaveBeenCalledWith('mock', { age: 10 })
    })

    it('skips filters with no value', async () => {
      const findCursor = getCursor()
      mockDb.find.mockReturnValue(findCursor)

      await collection.find({
        filter: {
          $limit: 10,
          $sort: undefined,
        },
      })

      expect(findCursor.limit).toHaveBeenCalledWith(10)
    })
  })

  describe('create', () => {
    it('returns created data [single]', async () => {
      const createCursor = getCursor()
      mockDb.create.mockReturnValue(createCursor)
      createCursor.exec.mockResolvedValue({ age: 10, name: 'Mock' })

      const result = await collection.create({ age: 10, name: 'Mock' })

      expect(result).toStrictEqual({ age: 10, name: 'Mock' })
    })

    it('returns created data [array]', async () => {
      const createCursor = getCursor()
      mockDb.create.mockReturnValue(createCursor)
      createCursor.exec.mockResolvedValue([{ age: 10, name: 'Mock' }])

      const result = await collection.create([{ age: 10, name: 'Mock' }])

      expect(result).toStrictEqual([{ age: 10, name: 'Mock' }])
    })

    it('throws when validation fails', async () => {
      await expect(
        async () => await collection.create({ age: 10 })
      ).rejects.toThrow()
    })
  })

  describe('get', () => {
    it('returns found data', async () => {
      const cursor = getCursor()
      cursor.exec.mockResolvedValue([{ name: 'mock' }])
      mockDb.find.mockReturnValue(cursor)
      const result = await collection.get('10')

      expect(mockDb.find).toHaveBeenCalledWith('mock', { _id: 10 })
      expect(cursor.limit).toHaveBeenCalledWith(1)
      expect(result).toStrictEqual({ name: 'mock' })
    })

    it('returns undefined if not found', async () => {
      const cursor = getCursor()
      cursor.exec.mockResolvedValue([])
      mockDb.find.mockReturnValue(cursor)
      const result = await collection.get('10')

      expect(result).toBe(undefined)
    })
  })

  describe('remove', () => {
    it('call db.remove correctly', async () => {
      mockDb.remove.mockResolvedValue()

      await collection.remove(['5', '6'])
      expect(mockDb.remove).toHaveBeenCalledWith('mock', [5, 6])

      await collection.remove('5')
      expect(mockDb.remove).toHaveBeenCalledWith('mock', 5)
    })
  })

  describe('patch', () => {
    it('returns patched data [single]', async () => {
      const cursor = getCursor()
      cursor.exec.mockResolvedValue({ _id: 10 })
      mockDb.patch.mockReturnValue(cursor)
      const res = await collection.patch('10', {}, {})

      expect(mockDb.patch).toHaveBeenCalledWith('mock', 10, {})
      expect(res).toStrictEqual({ _id: 10 })
    })

    it('returns patched data [array]', async () => {
      const cursor = getCursor()
      cursor.exec.mockResolvedValue([{ _id: 10 }, { _id: 11 }])
      mockDb.patch.mockReturnValue(cursor)
      const res = await collection.patch(['10', '11'], {}, {})

      expect(mockDb.patch).toHaveBeenCalledWith('mock', [10, 11], {})
      expect(res).toStrictEqual([{ _id: 10 }, { _id: 11 }])
    })

    it('when validation fails', async () => {
      const cursor = getCursor()
      cursor.exec.mockResolvedValue({ _id: 10 })
      mockDb.patch.mockReturnValue(cursor)

      await expect(collection.patch('10', { name: true }, {})).rejects.toThrow()
    })
  })
})
