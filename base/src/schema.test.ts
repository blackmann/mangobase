import { Schema, SchemaDefinitions, findRelations } from './schema.js'
import { describe, expect, it, test } from 'vitest'

describe('schema', () => {
  it('throws an error when data is null', () => {
    const schema = new Schema({})
    expect(() => schema.validate(null)).toThrow('`data` is undefined')
  })

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
      expect(schema.validate({ fullname: null })).toStrictEqual({})
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

    describe('enum', () => {
      const schema = new Schema({
        gender: { enum: ['male', 'female'], type: 'string' },
      })

      it('returns correctly with passed value', () => {
        expect(schema.validate({ gender: 'male' })).toStrictEqual({
          gender: 'male',
        })
      })

      it('throws when value is not in enum', () => {
        expect(() => schema.validate({ gender: 'x' })).toThrow(
          'gender: value is not one of the allowed values: male, female'
        )
      })
    })
  })

  describe('id type', () => {
    const schema = new Schema({
      id: { relation: 'mock', type: 'id' },
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
        id: { relation: 'mock', required: true, type: 'id' },
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
        id: { defaultValue: '123', relation: 'mock', type: 'id' },
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
          id: {
            defaultValue: '123',
            relation: 'mock',
            required: true,
            type: 'id',
          },
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
        id: {
          defaultValue: '123',
          relation: 'mock',
          required: true,
          type: 'id',
        },
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

    it('throws an error when getRef is not defined', () => {
      const schema = {
        address: {
          schema: 'string',
          type: 'object',
        },
      }

      expect(() =>
        new Schema({
          address: {
            schema: 'string',
            type: 'object',
          },
        }).validate(schema)
      ).toThrow('`getRef` is required when schema is a string.')
    })

    it('throws an error when schema cannot be found', () => {
      const schema = {
        address: {
          schema: 'string',
          type: 'object',
        },
      }

      expect(() =>
        new Schema(
          {
            address: {
              schema: 'string',
              type: 'object',
            },
          },
          {
            getRef: () => {
              return undefined
            },
          }
        ).validate(schema)
      ).toThrow('Schema ref with name `string` not found')
    })

    it('returns a valid schema definition when it exists', () => {
      expect(
        new Schema(
          {
            address: {
              schema: 'address',
              type: 'object',
            },
          },
          {
            getRef: (name) => {
              if (name !== 'address') {
                return
              }
              return {
                line1: { type: 'string' },
              }
            },
          }
        ).validate({ address: { line1: 'Nii Sai' } })
      ).toStrictEqual({ address: { line1: 'Nii Sai' } })
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
            schema: {},
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
          schema: {},
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

      expect(schema.validate({ profile: null })).toStrictEqual({
        profile: null,
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
        expect(schema.validate({ profile: null })).toStrictEqual({
          profile: null,
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
      tags: { items: { type: 'string' }, type: 'array' },
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
          items: { type: 'string' },
          required: true,
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
          items: { type: 'string' },
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
            items: { type: 'string' },
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

    describe('when tuple is defined', () => {
      const schema = new Schema({
        tags: {
          items: [
            { type: 'string' },
            { type: 'number' },
            { schema: { mock: { type: 'boolean' } }, type: 'object' },
          ],
          type: 'array',
        },
      })

      it('returns with data when valid', () => {
        const data = schema.validate({ tags: ['hello', 1, { mock: false }] })
        expect(data).toStrictEqual({ tags: ['hello', 1, { mock: false }] })
      })

      it('throws when data is invalid', () => {
        expect(() => schema.validate({ tags: [1, 'hello'] })).toThrow(
          'value is not of type `string`'
        )
      })
    })

    describe('when item is not of type array', () => {
      const schema = new Schema({
        tags: {
          defaultValue: ['Mock'],
          items: { type: 'string' },
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
        id: { relation: 'mock', type: 'id' },
      },
      {
        parser: (value, type) => {
          return type === 'id' ? parseInt(value, 10) : value
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
        comment: { type: 'any' },
        createdAt: { type: 'date' },
        fullname: { required: true, type: 'string' },
        happy: { type: 'boolean' },
        id: { relation: 'mock', type: 'id' },
      },
      {
        parser: (value, type) => {
          if (type === 'id') {
            return parseInt(value, 10)
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

      expect(
        schema.castQuery({ 'address.movedOn': '1703376000000' })
      ).toStrictEqual({
        'address.movedOn': new Date('2023-12-24'),
      })

      expect(
        schema.castQuery({ 'address.movedOn': { $gte: '1703376000000' } })
      ).toStrictEqual({
        'address.movedOn': { $gte: new Date('2023-12-24') },
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

      expect(schema.castQuery({ id: { $in: ['1', '2'] } })).toStrictEqual({
        id: { $in: [1, 2] },
      })

      expect(schema.castQuery({ id: '5' })).toStrictEqual({ id: 5 })

      expect(
        schema.castQuery({ comment: 'hello', 'comment.hello': 6 })
      ).toStrictEqual({
        comment: 'hello',
        'comment.hello': 6,
      })

      expect(schema.castQuery({ createdAt: 'hello' })).toStrictEqual({
        createdAt: 'hello',
      })

      expect(
        schema.castQuery({ createdAt: { $gte: undefined } })
      ).toStrictEqual({
        createdAt: {},
      })

      expect(schema.castQuery({ createdAt: { $gte: true } })).toStrictEqual({
        createdAt: {
          $gte: true,
        },
      })

      expect(schema.castQuery({ createdAt: { $gte: 'hello' } })).toStrictEqual({
        createdAt: {
          $gte: 'hello',
        },
      })

      expect(
        schema.castQuery({
          _id: { $gte: '8' },
          'other._id': { $in: ['9', '10'] },
          'some._id': '10',
        })
      ).toStrictEqual({
        _id: { $gte: 8 },
        'other._id': { $in: [9, 10] },
        'some._id': 10,
      })
    })
  })

  describe('ignore missing', () => {
    const schema = new Schema({ name: { required: true, type: 'string' } })

    it('should ignore missing value', () => {
      expect(schema.validate({}, false, true)).toStrictEqual({})
    })
  })

  describe('schema validation', () => {
    it('validates', () => {
      const schema: SchemaDefinitions = {
        address: {
          defaultValue: { line1: 'chale' },
          schema: {
            line1: { required: true, type: 'string' },
            line2: { type: 'string' },
            movedOn: { type: 'date' },
            rented: { defaultValue: true, type: 'boolean' },
          },
          type: 'object',
        },
        age: { type: 'number' },
        comment: { type: 'any' },
        createdAt: { type: 'date' },
        fullname: { required: true, type: 'string' },
        happy: { type: 'boolean' },
        region: { relation: 'region', type: 'id' },
        stuff: { items: { defaultValue: '5', type: 'string' }, type: 'array' },
        tags: {
          items: [{ type: 'string' }, { type: 'string' }],
          type: 'array',
        },
      }

      expect(() => Schema.validateSchema(schema)).not.toThrow()
    })

    it('throws a validation error when type is unknown', () => {
      const schema = {
        stuffs: { type: '' },
      }

      expect(() =>
        Schema.validateSchema(schema as unknown as SchemaDefinitions)
      ).toThrow('`type` is invalid or undefined')
    })

    describe('object type', () => {
      it('throws an error when schema definitions is not an object', () => {
        const schema = [{ stuffs: { type: 'array' } }]

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('schema has to be an object')
      })

      it('throws a validation error when schema does not exist', () => {
        const schema = {
          stuff: {
            defaultValue: true,
            type: 'object',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`schema` is required when type is `object`')
      })

      it('throws a validation error when object schema defaultValue is not an object', () => {
        const schema = {
          stuff: {
            defaultValue: 'man',
            schema: {},
            type: 'object',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`defaultValue` should be an object')
      })

      it('throws a validation error when object schema defaultValue is an array', () => {
        const schema = {
          stuff: {
            defaultValue: ['man'],
            schema: {},
            type: 'object',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`defaultValue` should be an object')
      })
    })

    describe('array type', () => {
      it('throws a validation error when items is not defined for an array', () => {
        const schema = {
          stuffs: { type: 'array' },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`items` is required when type is `array`')
      })

      it('throws a validation error when defaultValue is not an array', () => {
        const schema = {
          stuff: {
            defaultValue: 'name',
            items: { defaultValue: 'string', type: 'string' },
            type: 'array',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`defaultValue` should be an array')
      })

      it('throws an error when defaultValue does not match items definition', () => {
        const schema: SchemaDefinitions = {
          stuff: {
            defaultValue: [1, 2, 3, 4],
            items: { defaultValue: 'string', type: 'string' },
            type: 'array',
          },
        }

        expect(() => Schema.validateSchema(schema)).toThrow(
          'item: value is not of type `array`'
        )
      })
    })

    describe('boolean type', () => {
      it('throws a validation error when default value is not boolean', () => {
        const schema = {
          stuff: {
            defaultValue: 'true',
            type: 'boolean',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`defaultValue` should be a boolean')
      })
    })

    describe('date type', () => {
      it('throws validation error when default value is not a date', () => {
        const schema = {
          stuff: {
            defaultValue: 'true',
            type: 'date',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`defaultValue` should be a valid date')
      })
    })

    describe('id type', () => {
      it('throws a validation error when default value is not a string', () => {
        const schema = {
          stuff: {
            defaultValue: true,
            type: 'id',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`defaultValue` should be a string')
      })

      it('requires a relation when type is id', () => {
        const schema = {
          stuff: {
            defaultValue: '1234',
            type: 'id',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`relation` is required for type `id`')
      })
    })

    describe('number type', () => {
      it('throws a validation error when defalult value is not a number', () => {
        const schema = {
          stuff: {
            defaultValue: true,
            type: 'number',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`defaultValue` should be a number')
      })
    })

    describe('string type', () => {
      it('throws a validation error when default value is not a string', () => {
        const schema = {
          stuff: {
            defaultValue: {},
            type: 'string',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).not.toThrow('`defaultValue` should be an string')
      })

      it('throws an validation error when enum has no value', () => {
        const schema = {
          stuff: {
            defaultValue: 'string',
            enum: [],
            type: 'string',
          },
        }

        expect(() =>
          Schema.validateSchema(schema as unknown as SchemaDefinitions)
        ).toThrow('`enum` should have at least one value')
      })
    })
  })
})

test('findRelation', () => {
  expect(findRelations({}, 'mock')).toStrictEqual([])

  let schema: SchemaDefinitions = { address: { relation: 'mock', type: 'id' } }
  expect(findRelations(schema, 'mock')).toStrictEqual([['address', 'relation']])

  schema = {
    address: { schema: 'mock', type: 'object' },
  }
  expect(findRelations(schema, 'mock')).toStrictEqual([])

  schema = {
    address: {
      schema: {
        continent: { relation: 'mock', type: 'id' },
        country: { schema: 'mock', type: 'object' },
        line1: { type: 'string' },
      },
      type: 'object',
    },
    budget: {
      items: [
        { relation: 'mock', type: 'id' },
        { type: 'string' },
        {
          schema: {
            mock: { relation: 'mock', type: 'id' },
          },
          type: 'object',
        },
      ],
      type: 'array',
    },
    tours: {
      items: {
        relation: 'mock',
        type: 'id',
      },
      type: 'array',
    },
  }

  expect(findRelations(schema, 'mock')).toStrictEqual([
    ['address', 'schema', 'continent', 'relation'],
    ['budget', 'items', '0', 'relation'],
    ['budget', 'items', '2', 'schema', 'mock', 'relation'],
    ['tours', 'items', 'relation'],
  ])
})
