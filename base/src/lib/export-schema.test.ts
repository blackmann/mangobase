import { describe, expect, it } from 'vitest'
import { SchemaDefinitions } from '../schema'
import { exportSchema } from './export-schema'

describe('export-schema', () => {
  describe('typescript', () => {
    const schema: SchemaDefinitions = {
      address: {
        required: true,
        schema: {
          line1: { required: true, type: 'string' },
        },
        type: 'object',
      },
      age: { type: 'number' },
      alive: { required: true, type: 'boolean' },
      connection: { relation: 'something', type: 'id' },
      created_at: { required: true, type: 'date' },
      name: { required: true, type: 'string' },
    }

    it('should return typescript definition [include object schema]', async () => {
      expect(
        await exportSchema({
          getRef: async () => ({}),
          includeObjectSchema: true,
          language: 'typescript',
          name: 'test',
          schema,
        })
      ).toMatchSnapshot()
    })

    it('should return typescript definition [inline object]', async () => {
      expect(
        await exportSchema({
          getRef: async () => ({}),
          includeObjectSchema: true,
          inlineObjectSchema: true,
          language: 'typescript',
          name: 'test',
          schema,
        })
      ).toMatchSnapshot()
    })
  })
})
