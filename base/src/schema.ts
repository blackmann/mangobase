interface Definition {
  /** `id` values are always of the primitive type `string`.
   * Database adapters may need to convert to appropriate types.
   * When type is `id`, `relation` is required
   * */
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'id'
    | 'any'
    | 'object'
    | 'array'
    | 'date'

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
  schema?: Config
}

type Config = Record<string, Definition>

class Schema {
  config: Config

  constructor(config: Config) {
    this.config = config
  }

  validate(data: any, useDefault = false) {
    const validationMap = {
      any: validateAny,
      array: validateArray,
      boolean: validateBoolean,
      date: validateDate,
      id: validateId,
      number: validateNumber,
      object: validateObject,
      string: validateString,
    }

    for (const [key, definition] of Object.entries(this.config)) {
      const value = data[key]
      const validatedValue = validationMap[definition.type].call(
        null,
        { name: key, value },
        definition,
        useDefault
      )

      if (validatedValue !== undefined) {
        data[key] = validatedValue
      }
    }

    return data
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

function validateString(
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

function validateNumber(
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

function validateBoolean(
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

function validateId(data: Data, definition: Definition, useDefault = false) {
  return validateString(data, definition, useDefault)
}

function validateAny(data: Data, definition: Definition, useDefault = false) {
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

function validateObject(
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

  const schema = new Schema(definition.schema!)

  try {
    return schema.validate(data.value, useDefault)
  } catch (err) {
    if (err instanceof ValidationError) {
      throw new ValidationError(`${data.name}.${err.field}`, err.detail)
    }
  }
}

function validateArray(data: Data, definition: Definition, useDefault = false) {
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

  const schema = new Schema(definition.schema!)
  return data.value.map((item) => {
    return schema.validate({ item }).item
  })
}

function validateDate(data: Data, definition: Definition, useDefault = false) {
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

export default Schema

export { ValidationError }

export type { Config }
