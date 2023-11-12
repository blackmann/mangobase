import { type ExportResult, exportSchema } from './export-schema.js'
import { describe, expect, it } from 'vitest'
import { SchemaDefinitions } from '../schema.js'

function render({ definition, includes }: ExportResult) {
  return [definition, Object.values(includes).join('\n\n')].join('\n\n')
}

describe('export-schema', () => {
  describe('typescript', () => {
    const schema: SchemaDefinitions = {
      address: {
        required: true,
        schema: {
          country: {
            required: true,
            schema: {
              code: { defaultValue: 'GH', type: 'string' },
              title: { required: true, type: 'string' },
            },
            type: 'object',
          },
          line1: { required: true, type: 'string' },
        },
        type: 'object',
      },
      age: { type: 'number' },
      alive: { required: true, type: 'boolean' },
      connection: { relation: 'something', type: 'id' },
      created_at: { required: true, type: 'date' },
      friends_contacts: {
        items: {
          schema: {
            email: { required: true, type: 'string' },
            name: { required: true, type: 'string' },
          },
          type: 'object',
        },
        required: true,
        type: 'array',
      },
      name: { required: true, type: 'string' },
      tags: { items: { type: 'string' }, type: 'array' },
    }

    it('should return typescript definition [include object schema]', async () => {
      expect(
        render(
          await exportSchema({
            getRef: async () => ({}),
            includeObjectSchema: true,
            language: 'typescript',
            name: 'test',
            schema,
          })
        )
      ).toMatchSnapshot()
    })

    it('should return typescript definition [inline object]', async () => {
      expect(
        render(
          await exportSchema({
            getRef: async () => ({}),
            includeObjectSchema: true,
            inlineObjectSchema: true,
            language: 'typescript',
            name: 'test',
            schema,
          })
        )
      ).toMatchSnapshot()
    })
  })
})
