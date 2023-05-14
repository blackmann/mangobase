type DefinitionType =
  | 'any'
  | 'array'
  | 'boolean'
  | 'date'
  | 'id'
  | 'number'
  | 'object'
  | 'string'

interface Definition {
  /** `id` values are always of the primitive type `string`.
   * Database adapters may need to convert to appropriate types.
   * When type is `id`, `relation` is required
   * */
  type: DefinitionType

  defaultValue?: any

  required?: boolean

  /** `unique` constraints do not apply to type of `any` */
  unique?: boolean

  /** The collection ID of the relation. This only applies when type is `id`. */
  relation?: string

  /** `schema` only applies when type is `object` or `array`.
   * When type is `array` the definition is nested in an `item` field.
   * For example:
   * ```javascript
   * const definition = {
   *   type: 'array',
   *   schema: { item: { type: 'string' } }
   * }
   * ```
   * */
  schema?: SchemaDefinitions
}

type SchemaDefinitions = Record<string, Definition>
interface Options {
  /**
   * Parsers are used to convert incoming values to formats that the database _prefers_.
   * For example, Mongo IDs are supposed to be `mongo.ObjectId`s. So a parser may be defined
   *
   */
  parser?: (value: any, type: DefinitionType) => any
}

class ValidationError extends Error {
  field: string
  detail: string

  constructor(field: string, detail: string) {
    super(`${field}: ${detail}`)
    this.field = field
    this.detail = detail
  }
}

interface Data {
  name: string
  value: any
}

class Schema {
  schema: SchemaDefinitions
  parser: (value: any, type: DefinitionType) => any

  private validationMap = {
    any: this.validateAny.bind(this),
    array: this.validateArray.bind(this),
    boolean: this.validateBoolean.bind(this),
    date: this.validateDate.bind(this),
    id: this.validateId.bind(this),
    number: this.validateNumber.bind(this),
    object: this.validateObject.bind(this),
    string: this.validateString.bind(this),
  }

  constructor(schema: SchemaDefinitions, options: Options = {}) {
    this.schema = schema
    this.parser = options.parser || ((value) => value)
  }

  cast(data: any, type: DefinitionType) {
    if (data === undefined) {
      return
    }

    return this.parser.call(null, data, type)
  }

  /**
   * Queries are supposed to have simple keys and simple/primitive values.
   * A query like the following is not supported.
   * ```javascript
   * const q = {
   *  address: { line1: 'Mock line 1' }
   * }
   * ```
   *
   * This should be re-written as the following instead
   * ```javascript
   * const q = { 'address.line1': 'Mock line 1' }
   * ```
   *
   * With this knowledge, only nested query operators (eg. $in) are also considered.
   */
  castQuery(query: Record<string, any>) {
    const res = structuredClone(query)

    for (const [key, value] of Object.entries(res)) {
      const definition = this.getDefinitionAtPath(key)

      switch (definition?.type) {
        case 'boolean': {
          res[key] = this.cast(['1', 'true', true].includes(value), 'boolean')
          break
        }

        case 'date': {
          const date = new Date(value)
          if (typeof value === 'object') {
            this.castOperatorValues(value, 'date', getDate)
          }

          if (isNaN(date.getTime())) {
            continue
          }

          res[key] = this.cast(date, 'date')
          break
        }

        case 'number': {
          if (typeof value === 'object') {
            // handle only query operators
            this.castOperatorValues(value, 'number', getNumber)
            break
          }

          const num = getNumber(value)

          if (isNaN(num)) {
            continue
          }

          res[key] = this.cast(num, 'number')

          break
        }

        case 'any':
        case 'array':
        case 'object': {
          // we're only looking at primitives
          continue
        }

        case 'id': {
          res[key] = this.cast(value, 'id')
          break
        }

        case 'string': {
          res[key] = this.cast(value, 'string')
          break
        }

        default: {
          // maybe a query operator
        }
      }
    }

    return res
  }

  private castOperatorValues(
    value: Record<string, any>,
    type: DefinitionType,
    parse: (value: any) => any
  ) {
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$')) {
        if (Array.isArray(v)) {
          v.forEach((item, index) => {
            const parsed = parse(item)
            if (!isNaN(parsed)) {
              v[index] = this.cast(parsed, type)
            }
          })

          continue
        }

        const parsed = parse(v)
        if (!isNaN(parsed)) {
          value[k] = this.cast(parsed, type)
        }
      }
    }
  }

  validate(data: any, useDefault = false) {
    const res = structuredClone(data)

    for (const [key, definition] of Object.entries(this.schema)) {
      const value = res[key]
      const validatedValue = this.validationMap[definition.type].call(
        null,
        { name: key, value },
        definition,
        useDefault
      )

      if (validatedValue !== undefined) {
        res[key] = this.cast(validatedValue, definition.type)
      }
    }

    return res
  }

  private getDefinitionAtPath(path: string): Definition | undefined {
    const [segment, ...rest] = path.split('.')
    const definition = this.schema[segment]

    if (!definition || !rest.length) {
      return definition
    }

    if (definition.type === 'object' || definition.type === 'array') {
      return new Schema(definition.schema!).getDefinitionAtPath(rest.join('.'))
    }

    // Returning undefined because there's more segments to resolve (from ...rest)
    // but they're neither an object or array in the schema
    return undefined
  }

  private validateString(
    data: Data,
    definition: Definition,
    useDefault = false
  ) {
    if (data.value === undefined || data.value === '') {
      if (useDefault) {
        return definition.defaultValue
      }

      if (!definition.required) {
        return data.value
      }

      throw new ValidationError(
        data.name,
        'required field has missing/empty value'
      )
    }

    if (typeof data.value !== 'string') {
      throw new ValidationError(data.name, 'value is not of type `string`')
    }

    return data.value as string
  }

  private validateNumber(
    data: Data,
    definition: Definition,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault) {
        return definition.defaultValue
      }

      if (definition.required) {
        throw new ValidationError(data.name, 'required field')
      }

      return data.value
    }

    if (typeof data.value !== 'number') {
      throw new ValidationError(data.name, 'value is not of type `number`')
    }

    return data.value
  }

  private validateBoolean(
    data: Data,
    definition: Definition,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault) {
        return definition.defaultValue
      }

      if (definition.required) {
        throw new ValidationError(data.name, 'required field')
      }

      return data.value
    }

    if (typeof data.value !== 'boolean') {
      throw new ValidationError(data.name, 'value is not of type `boolean`')
    }

    return data.value
  }

  private validateId(data: Data, definition: Definition, useDefault = false) {
    return this.validateString(data, definition, useDefault)
  }

  private validateAny(data: Data, definition: Definition, useDefault = false) {
    if (data.value === undefined) {
      if (useDefault) {
        return definition.defaultValue
      }

      if (definition.required) {
        throw new ValidationError(data.name, 'required field')
      }
    }

    return data.value
  }

  private validateObject(
    data: Data,
    definition: Definition,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault) {
        return definition.defaultValue
      }

      if (definition.required) {
        throw new ValidationError(data.name, 'required field')
      }

      return data.value
    }

    if (typeof data.value !== 'object' || Array.isArray(data.value)) {
      throw new ValidationError(data.name, 'value is not of type `object`')
    }

    const schema = new Schema(definition.schema!, { parser: this.parser })

    try {
      return schema.validate(data.value, useDefault)
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new ValidationError(`${data.name}.${err.field}`, err.detail)
      }
    }
  }

  private validateArray(
    data: Data,
    definition: Definition,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault) {
        return definition.defaultValue
      }

      if (definition.required) {
        throw new ValidationError(data.name, 'required field')
      }

      return data.value
    }

    if (!Array.isArray(data.value)) {
      throw new ValidationError(data.name, 'value is not of type `array`')
    }

    const schema = new Schema(definition.schema!, { parser: this.parser })
    return data.value.map((item) => {
      return schema.validate({ item }).item
    })
  }

  private validateDate(data: Data, definition: Definition, useDefault = false) {
    if (data.value === undefined) {
      if (useDefault) {
        return new Date(definition.defaultValue)
      }

      if (definition.required) {
        throw new ValidationError(data.name, 'required field')
      }

      return data.value
    }

    if (!['number', 'string'].includes(typeof data.value)) {
      throw new ValidationError(
        data.name,
        'date value should be of string or number type'
      )
    }

    const date = new Date(data.value)
    if (isNaN(date.getTime())) {
      throw new ValidationError(
        data.name,
        'value is not a valid date format. use number or ISO date string'
      )
    }

    return date
  }
}

function getNumber(value: any) {
  return Number(value)
}

function getDate(value: any) {
  if (value === undefined) {
    return value
  }

  if (!['string', 'number'].includes(typeof value)) {
    return value
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return value
  }

  return date
}

export default Schema

export { ValidationError }

export type { SchemaDefinitions, Definition, DefinitionType }
