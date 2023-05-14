import { describe, expect, it, test } from 'vitest'
import Schema from './schema'

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
        fullname: { required: true, type: 'string' },
      })

      it('returns correctly', () => {
        expect(schema.validate({ fullname: 'hello' })).toStrictEqual({
          fullname: 'hello',
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow(
          'required field has missing/empty value'
        )
      })

      it('throws when an empty string is passed', () => {
        expect(() => schema.validate({ fullname: '' })).toThrowError(
          'required field has missing/empty value'
        )
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        fullname: { defaultValue: 'Mock', type: 'string' },
      })

      it('does not set default value when a value is passed', () => {
        expect(schema.validate({ fullname: 'hello' }, true)).toStrictEqual({
          fullname: 'hello',
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validate({}, true)).toStrictEqual({
          fullname: 'Mock',
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          fullname: { defaultValue: 'Mock', required: true, type: 'string' },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validate({}, true)).toStrictEqual({
            fullname: 'Mock',
          })
        })
      })
    })

    describe('when value is not of type string', () => {
      const schema = new Schema({
        fullname: { defaultValue: 'Mock', required: true, type: 'string' },
      })

      it('throws', () => {
        expect(() => schema.validate({ fullname: 10 })).toThrow(
          'value is not of type `string`'
        )
      })
    })
  })

  describe('id type', () => {
    const schema = new Schema({
      id: { type: 'id' },
    })

    it('returns correctly with passed value', () => {
      expect(schema.validate({ id: '123' })).toStrictEqual({
        id: '123',
      })
    })

    it('ignores when no value is passed', () => {
      expect(schema.validate({})).toStrictEqual({})
    })

    describe('when required', () => {
      const schema = new Schema({
        id: { required: true, type: 'id' },
      })

      it('returns correctly', () => {
        expect(schema.validate({ id: '123' })).toStrictEqual({
          id: '123',
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow('required field')
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        id: { defaultValue: '123', type: 'id' },
      })

      it('does not set default value when a value is passed', () => {
        expect(schema.validate({ id: '456' }, true)).toStrictEqual({
          id: '456',
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validate({}, true)).toStrictEqual({
          id: '123',
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          id: { defaultValue: '123', required: true, type: 'id' },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validate({}, true)).toStrictEqual({
            id: '123',
          })
        })
      })
    })

    describe('when value is not of type string', () => {
      const schema = new Schema({
        id: { defaultValue: '123', required: true, type: 'id' },
      })

      it('throws', () => {
        expect(() => schema.validate({ id: 10 })).toThrow(
          'value is not of type `string`'
        )
      })
    })
  })

  describe('number type', () => {
    const schema = new Schema({
      age: { type: 'number' },
    })

    it('returns correctly with passed value', () => {
      expect(schema.validate({ age: 10 })).toStrictEqual({
        age: 10,
      })
    })

    it('ignores when no value is passed', () => {
      expect(schema.validate({})).toStrictEqual({})
    })

    describe('when required', () => {
      const schema = new Schema({
        age: { required: true, type: 'number' },
      })

      it('returns correctly', () => {
        expect(schema.validate({ age: 10 })).toStrictEqual({
          age: 10,
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow('required field')
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        age: { defaultValue: 10, type: 'number' },
      })

      it('does not set default value when a value is passed', () => {
        expect(schema.validate({ age: 20 }, true)).toStrictEqual({
          age: 20,
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validate({}, true)).toStrictEqual({
          age: 10,
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          age: { defaultValue: 10, required: true, type: 'number' },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validate({}, true)).toStrictEqual({
            age: 10,
          })
        })
      })
    })

    describe('when value is not of type number', () => {
      const schema = new Schema({
        age: { defaultValue: 10, required: true, type: 'number' },
      })

      it('throws', () => {
        expect(() => schema.validate({ age: 'hello' })).toThrow(
          'value is not of type `number`'
        )
      })
    })
  })

  describe('boolean type', () => {
    const schema = new Schema({
      isAdult: { type: 'boolean' },
    })

    it('returns correctly with passed value', () => {
      expect(schema.validate({ isAdult: true })).toStrictEqual({
        isAdult: true,
      })
    })

    it('ignores when no value is passed', () => {
      expect(schema.validate({})).toStrictEqual({})
    })

    describe('when required', () => {
      const schema = new Schema({
        isAdult: { required: true, type: 'boolean' },
      })

      it('returns correctly', () => {
        expect(schema.validate({ isAdult: true })).toStrictEqual({
          isAdult: true,
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow('required field')
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        isAdult: { defaultValue: false, type: 'boolean' },
      })

      it('does not set default value when a value is passed', () => {
        expect(schema.validate({ isAdult: true }, true)).toStrictEqual({
          isAdult: true,
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validate({}, true)).toStrictEqual({
          isAdult: false,
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          isAdult: { defaultValue: false, required: true, type: 'boolean' },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validate({}, true)).toStrictEqual({
            isAdult: false,
          })
        })
      })
    })

    describe('when value is not of type boolean', () => {
      const schema = new Schema({
        isAdult: { defaultValue: false, required: true, type: 'boolean' },
      })

      it('throws', () => {
        expect(() => schema.validate({ isAdult: 'hello' })).toThrow(
          'value is not of type `boolean`'
        )
      })
    })
  })

  describe('object type', () => {
    const schema = new Schema({
      profile: { schema: { name: { type: 'string' } }, type: 'object' },
    })

    it('returns correctly with passed value', () => {
      expect(schema.validate({ profile: { name: 'Jane' } })).toStrictEqual({
        profile: { name: 'Jane' },
      })
    })

    it('ignores when no value is passed', () => {
      expect(schema.validate({})).toStrictEqual({})
    })

    describe('when required', () => {
      const schema = new Schema({
        profile: {
          required: true,
          schema: { name: { type: 'string' } },
          type: 'object',
        },
      })

      it('returns correctly', () => {
        expect(schema.validate({ profile: { name: 'Jane' } })).toStrictEqual({
          profile: { name: 'Jane' },
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow('required field')
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        profile: {
          defaultValue: { name: 'Mock' },
          schema: { name: { type: 'string' } },
          type: 'object',
        },
      })

      it('does not set default value when a value is passed', () => {
        expect(
          schema.validate({ profile: { name: 'Jane' } }, true)
        ).toStrictEqual({
          profile: { name: 'Jane' },
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validate({}, true)).toStrictEqual({
          profile: { name: 'Mock' },
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          profile: {
            defaultValue: { name: 'Mock' },
            required: true,
            type: 'object',
          },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validate({}, true)).toStrictEqual({
            profile: { name: 'Mock' },
          })
        })
      })
    })

    describe('when nested data is invalid', () => {
      const schema = new Schema({
        profile: {
          schema: { name: { type: 'string' } },
          type: 'object',
        },
      })

      it('throws', () => {
        expect(() => schema.validate({ profile: { name: 10 } })).toThrow(
          'value is not of type `string`'
        )
      })
    })

    describe('when value is not of type object', () => {
      const schema = new Schema({
        profile: {
          defaultValue: { name: 'Mock' },
          required: true,
          type: 'object',
        },
      })

      it('throws', () => {
        expect(() => schema.validate({ profile: 'hello' })).toThrow(
          'value is not of type `object`'
        )
      })
    })
  })

  describe('any type', () => {
    const schema = new Schema({
      profile: { type: 'any' },
    })

    it('returns correctly with passed value', () => {
      expect(schema.validate({ profile: { name: 'Jane' } })).toStrictEqual({
        profile: { name: 'Jane' },
      })
    })

    it('ignores when no value is passed', () => {
      expect(schema.validate({})).toStrictEqual({})
    })

    describe('when required', () => {
      const schema = new Schema({
        profile: { required: true, type: 'any' },
      })

      it('returns correctly', () => {
        expect(schema.validate({ profile: { name: 'Jane' } })).toStrictEqual({
          profile: { name: 'Jane' },
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow('required field')
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        profile: { defaultValue: { name: 'Mock' }, type: 'any' },
      })

      it('does not set default value when a value is passed', () => {
        expect(
          schema.validate({ profile: { name: 'Jane' } }, true)
        ).toStrictEqual({
          profile: { name: 'Jane' },
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validate({}, true)).toStrictEqual({
          profile: { name: 'Mock' },
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          profile: {
            defaultValue: { name: 'Mock' },
            required: true,
            type: 'any',
          },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validate({}, true)).toStrictEqual({
            profile: { name: 'Mock' },
          })
        })
      })
    })
  })

  describe('array type', () => {
    const schema = new Schema({
      tags: { schema: { item: { type: 'string' } }, type: 'array' },
    })

    it('returns correctly with passed value', () => {
      expect(schema.validate({ tags: ['hello'] })).toStrictEqual({
        tags: ['hello'],
      })
    })

    it('ignores when no value is passed', () => {
      expect(schema.validate({})).toStrictEqual({})
    })

    describe('when required', () => {
      const schema = new Schema({
        tags: {
          required: true,
          schema: { item: { type: 'string' } },
          type: 'array',
        },
      })

      it('returns correctly', () => {
        expect(schema.validate({ tags: ['hello'] })).toStrictEqual({
          tags: ['hello'],
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow('required field')
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        tags: {
          defaultValue: ['Mock'],
          schema: { item: { type: 'string' } },
          type: 'array',
        },
      })

      it('does not set default value when a value is passed', () => {
        expect(schema.validate({ tags: ['hello'] }, true)).toStrictEqual({
          tags: ['hello'],
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validate({}, true)).toStrictEqual({
          tags: ['Mock'],
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          tags: {
            defaultValue: ['Mock'],
            required: true,
            type: 'array',
          },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validate({}, true)).toStrictEqual({
            tags: ['Mock'],
          })
        })
      })
    })

    describe('when item is not of type array', () => {
      const schema = new Schema({
        tags: {
          defaultValue: ['Mock'],
          required: true,
          type: 'array',
        },
      })

      it('throws', () => {
        expect(() => schema.validate({ tags: 'hello' })).toThrow(
          'value is not of type `array`'
        )
      })
    })
  })

  describe('date type', () => {
    const schema = new Schema({
      dob: { type: 'date' },
    })

    it('returns correctly with passed value', () => {
      expect(
        schema.validate({ dob: '2023-05-12T10:30:00.000Z' })
      ).toStrictEqual({
        dob: new Date('2023-05-12T10:30:00.000Z'),
      })
    })

    it('ignores when no value is passed', () => {
      expect(schema.validate({})).toStrictEqual({})
    })

    describe('when required', () => {
      const schema = new Schema({
        dob: { required: true, type: 'date' },
      })

      it('returns correctly', () => {
        expect(
          schema.validate({ dob: '2023-05-12T10:30:00.000Z' })
        ).toStrictEqual({
          dob: new Date('2023-05-12T10:30:00.000Z'),
        })
      })

      it('throws when not passed', () => {
        expect(() => schema.validate({})).toThrow('required field')
      })
    })

    describe('with default value', () => {
      const schema = new Schema({
        dob: { defaultValue: '2023-05-12T10:30:00.000Z', type: 'date' },
      })

      it('does not set default value when a value is passed', () => {
        expect(
          schema.validate({ dob: '2023-05-12T10:30:00.000Z' }, true)
        ).toStrictEqual({
          dob: new Date('2023-05-12T10:30:00.000Z'),
        })
      })

      it('sets default value when no value is passed', () => {
        expect(schema.validate({}, true)).toStrictEqual({
          dob: new Date('2023-05-12T10:30:00.000Z'),
        })
      })

      describe('when field is required', () => {
        const schema = new Schema({
          dob: {
            defaultValue: '2023-05-12T10:30:00.000Z',
            required: true,
            type: 'date',
          },
        })

        it('sets default value when no value is passed', () => {
          expect(schema.validate({}, true)).toStrictEqual({
            dob: new Date('2023-05-12T10:30:00.000Z'),
          })
        })
      })
    })

    describe('when value is not of type date', () => {
      const schema = new Schema({
        dob: { defaultValue: '2023-05-12T10:30:00.000Z', type: 'date' },
      })

      it('throws', () => {
        expect(() => schema.validate({ dob: false })).toThrow(
          'date value should be of string or number type'
        )
      })
    })

    describe('when date is invalid', () => {
      const schema = new Schema({
        dob: { defaultValue: '2023-05-12T10:30:00.000Z', type: 'date' },
      })

      it('throws', () => {
        expect(() => schema.validate({ dob: 'hello' })).toThrow(
          'value is not a valid date format. use number or ISO date string'
        )
      })
    })
  })

  describe('casting', () => {
    const schema = new Schema(
      {
        fullname: { required: true, type: 'string' },
        id: { type: 'id' },
      },
      {
        parser: (value, type) => {
          return type === 'id' ? parseInt(value) : value
        },
      }
    )

    it('parses id field correctly', () => {
      expect(schema.validate({ fullname: 'Mock', id: '10' })).toStrictEqual({
        fullname: 'Mock',
        id: 10,
      })
    })

    it('direct casting', () => {
      expect(schema.cast(undefined, 'id')).toBe(undefined)
    })
  })

  describe('query casting', () => {
    const schema = new Schema(
      {
        address: {
          schema: {
            line1: { required: true, type: 'string' },
            line2: { type: 'string' },
            movedOn: { type: 'date' },
            rented: { defaultValue: true, type: 'boolean' },
          },
          type: 'object',
        },
        age: { type: 'number' },
        createdAt: { type: 'date' },
        fullname: { required: true, type: 'string' },
        happy: { type: 'boolean' },
        id: { type: 'id' },
      },
      {
        parser: (value, type) => {
          if (type === 'id') {
            return parseInt(value)
          }

          return value
        },
      }
    )

    test('casts queries correctly', () => {
      expect(
        schema.castQuery({
          'address.line1': 'mock',
          'address.movedOn': '2023-10-10',
          happy: 'true',
        })
      ).toStrictEqual({
        'address.line1': 'mock',
        'address.movedOn': new Date('2023-10-10'),
        happy: true,
      })

      expect(schema.castQuery({ age: '100' })).toStrictEqual({ age: 100 })
      expect(schema.castQuery({ age: 10 })).toStrictEqual({ age: 10 })
      expect(schema.castQuery({ age: 'b' })).toStrictEqual({ age: 'b' })
      expect(schema.castQuery({ age: { $gte: '5' } })).toStrictEqual({
        age: { $gte: 5 },
      })

      expect(schema.castQuery({ age: { $in: ['5', '6'] } })).toStrictEqual({
        age: { $in: [5, 6] },
      })

      expect(schema.castQuery({ age: { $in: ['a'] } })).toStrictEqual({
        age: { $in: ['a'] },
      })

      expect(
        schema.castQuery({ 'address.line1': { $in: ['mock 1', 'mock_2'] } })
      ).toStrictEqual({ 'address.line1': { $in: ['mock 1', 'mock_2'] } })

      expect(
        schema.castQuery({
          'address.movedOn': { $gt: '2023-10-10', $lt: '2023-11-10' },
        })
      ).toStrictEqual({
        'address.movedOn': {
          $gt: new Date('2023-10-10'),
          $lt: new Date('2023-11-10'),
        },
      })
    })
  })
})
