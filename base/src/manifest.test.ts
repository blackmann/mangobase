import { afterAll, describe, expect, it } from 'vitest'
import { rm, stat } from 'fs/promises'
import Manifest from './manifest'
import assert from 'assert'

describe('Manifest', () => {
  const manifest = new Manifest()

  afterAll(async () => {
    try {
      // this is a safeguard so that files are not mistakenly removed
      assert(Manifest.getDirectory() === '.mangobase')
      await rm(Manifest.getDirectory(), { recursive: true })
    } catch (err) {
      console.log(err)
    }
  })

  describe('collections', () => {
    it('adds and saves collection config', async () => {
      await manifest.collection('mock', {
        indexes: [],
        name: 'mock',
        schema: { name: { type: 'string' } },
      })

      expect(
        stat([Manifest.getDirectory(), 'collections.json'].join('/'))
      ).toBeDefined()

      expect(await manifest.collection('mock')).toStrictEqual({
        indexes: [],
        name: 'mock',
        schema: { name: { type: 'string' } },
      })
    })

    it('removes collection', async () => {
      await manifest.removeCollection('mock')
      expect(await manifest.collection('mock')).toBe(undefined)
    })
  })
})
