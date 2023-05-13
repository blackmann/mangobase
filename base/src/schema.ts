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
  parsers?: Partial<Record<DefinitionType, (value: any) => any>>
}

class Schema {
  schema: SchemaDefinitions
  parsers: Partial<Record<DefinitionType, (value: any) => any>>

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
    this.parsers = options.parsers || {}
  }

  cast(data: any, type: DefinitionType) {
    if (data === undefined) {
      return
    }

    const parser = this.parsers[type]
    return parser ? parser(data) : data
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

      //
    }

    return res
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

    const schema = new Schema(definition.schema!, { parsers: this.parsers })

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

    const schema = new Schema(definition.schema!, { parsers: this.parsers })
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

export default Schema

export { ValidationError }

export type { SchemaDefinitions, Definition, DefinitionType }
