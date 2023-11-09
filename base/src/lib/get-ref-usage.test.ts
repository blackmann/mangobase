import { describe, expect, it } from 'vitest'
import { SchemaDefinitions } from '../schema'
import getRefUsage from './get-ref-usage'

describe('getRefUsage', () => {
  const schema: SchemaDefinitions = {
    arr1: {
      items: {
        schema: 'ref1',
        type: 'object',
      },
      type: 'array',
    },
    obj1: {
      schema: {
        obj2: {
          schema: {
            ref1: {
              schema: 'ref1',
              type: 'object',
            },
          },
          type: 'object',
        },
      },
      type: 'object',
    },
    ref1: {
      schema: {
        prop1: {
          type: 'string',
        },
      },
      type: 'object',
    },
  }

  it('should return an empty array if refName is not found in schema', () => {
    const refName = 'ref2'
    const usage = getRefUsage(refName, schema)
    expect(usage).toEqual([])
  })

  it('should return an array of paths where refName is used in schema', () => {
    const refName = 'ref1'
    const usage = getRefUsage(refName, schema)
    expect(usage).toEqual([['arr1'], ['obj1', 'obj2', 'ref1']])
  })
})
