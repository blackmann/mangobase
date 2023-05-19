import { describe, expect, it, vi } from 'vitest'
import App from './app'
import CollectionService from './collection-service'
import { Database } from './database'
import Manifest from './manifest'

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
        headers: {},
        method: 'create',
        path: '/',
        query: {
          $populate: ['address'],
          age: 'hello',
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
        headers: {},
        method: 'find',
        path: '/',
        query: { $limit: 1, $skip: 10, $sort: { name: '-1' }, name: 'mock' },
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
        headers: {},
        method: 'get',
        params: { id: '123' },
        path: '/',
        query: {
          $populate: ['address'],
          $select: ['address', 'address.region'],
          $sort: { name: '100' },
          name: 'mock',
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
        data: { name: 'mock' },
        headers: {},
        method: 'patch',
        params: { id: '123' },
        path: '/',
        query: {
          $populate: 'address',
          $select: 'address',
          $sort: 'invalid',
          name: 'mock',
        },
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
        headers: {},
        method: 'remove',
        params: { id: '123' },
        path: '/',
        query: { $populate: ['address'], name: 'mock' },
      })

      expect(service.collection.remove).toHaveBeenCalledWith('123')
    })
  })
})
