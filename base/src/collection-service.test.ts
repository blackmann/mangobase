import { describe, expect, it, vi } from 'vitest'
import CollectionService from './collection-service'
import { Database } from './database'
import Manifest from './manifest'
import App from './app'

vi.mock('./collection')

const mockDatabase = {} as unknown as Database

const app: Partial<App> = {
  database: mockDatabase,
  manifest: {} as unknown as Manifest,
}

describe('CollectionService', () => {
  describe('create', () => {
    it('checks', async () => {
      const service = new CollectionService(app as unknown as App, 'mock')
      await service.handle({
        data: { name: 'mock' },
        method: 'create',
        headers: {},
        query: {
          age: 'hello',
          $populate: ['address'],
        },
      })

      expect(service.collection.create).toHaveBeenCalledWith(
        { name: 'mock' },
        { $populate: ['address'] }
      )
    })
  })

  describe('find', () => {
    it('checks', async () => {
      const service = new CollectionService(app as unknown as App, 'mock')
      await service.handle({
        method: 'find',
        headers: {},
        query: { name: 'mock', $limit: 1, $skip: 10, $sort: { name: '-1' } },
      })

      expect(service.collection.find).toHaveBeenCalledWith({
        filter: { $limit: 1, $skip: 10, $sort: { name: -1 } },
        query: { name: 'mock' },
      })
    })
  })

  describe('get', () => {
    it('checks', async () => {
      const service = new CollectionService(app as unknown as App, 'mock')
      await service.handle({
        method: 'get',
        headers: {},
        id: '123',
        query: {
          name: 'mock',
          $populate: ['address'],
          $select: ['address', 'address.region'],
          $sort: { name: '100' },
        },
      })

      expect(service.collection.get).toHaveBeenCalledWith('123', {
        $populate: ['address'],
        $select: ['address', 'address.region'],
      })
    })
  })

  describe('patch', () => {
    it('checks', async () => {
      const service = new CollectionService(app as unknown as App, 'mock')
      await service.handle({
        method: 'patch',
        headers: {},
        id: '123',
        data: { name: 'mock' },
        query: { name: 'mock', $populate: 'address', $sort: 'invalid', $select: 'address' },
      })

      expect(service.collection.patch).toHaveBeenCalledWith(
        '123',
        { name: 'mock' },
        { $populate: ['address'], $select: ['address'] }
      )
    })
  })

  describe('remove', () => {
    it('checks', async () => {
      const service = new CollectionService(app as unknown as App, 'mock')
      await service.handle({
        method: 'remove',
        headers: {},
        id: '123',
        query: { name: 'mock', $populate: ['address'] },
      })

      expect(service.collection.remove).toHaveBeenCalledWith('123')
    })
  })
})
