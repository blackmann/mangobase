import { Cursor, Database } from './database'
import { describe, expect, it, vi } from 'vitest'
import Collection from './collection'
import { MockedObject } from 'vitest'

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

const mockDb: MockedObject<Database> = {
  cast: vi.fn((value, type) => value),
  count: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
  patch: vi.fn(),
  remove: vi.fn(),
}

describe('collections', () => {
  describe('find', () => {
    const collection = new Collection('mock', { db: mockDb })

    it('returns results if there is', async () => {
      const findCursor = getCursor()
      mockDb.find.mockReturnValue(findCursor)
      findCursor.exec.mockResolvedValue([])

      const countCursor = getCursor()
      mockDb.count.mockReturnValue(countCursor)
      countCursor.exec.mockResolvedValue(10)

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
})
