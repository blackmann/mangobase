import Schema, { ValidationError } from './schema'
import { describe, expect, it } from 'vitest'

describe('schema', () => {
  describe('string type', () => {
    const schema = new Schema({
      fullname: { type: 'string' },
    })

    it('returns correctly with passed value', () => {
      expect(schema.validate({ fullname: 'Jane' })).toStrictEqual({
        fullname: 'Jane',
      })
    })

    it('ignores when no value is passed', () => {
      expect(schema.validate({})).toStrictEqual({})
    })

    describe('when required', () => {
      const schema = new Schema({
        fullname: { type: 'string', required: true },
      })

      it('returns correctly', () => {
        expect(schema.validate({ fullname: 'hello' })).toStrictEqual({
          fullname: 'hello',
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow('field is required')
      })

      it('throws when an empty string is passed', () => {
        expect(() => schema.validate({ fullname: '' })).toThrowError(
          'an empty value was passed'
        )
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        fullname: { type: 'string', defaultValue: 'Mock' },
      })

      it('does not set default value when a value is passed', () => {
        expect(schema.validateWithDefaults({ fullname: 'hello' })).toStrictEqual({
          fullname: 'hello',
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validateWithDefaults({})).toStrictEqual({
          fullname: 'Mock',
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          fullname: { type: 'string', required: true, defaultValue: 'Mock' },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validateWithDefaults({})).toStrictEqual({ fullname: 'Mock' })
        })
      })
    })
  })
})
