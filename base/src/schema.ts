interface Definition {
  /** `id` values are always of the primitive type `string`.
   * Database adapters may need to convert to appropriate types.
   * When type is `id`, `relation` is required
   * */
  type: 'string' | 'number' | 'boolean' | 'id' | 'any' | 'object'

  defaultValue?: any

  required?: boolean

  /** `unique` constraints do not apply to type of `any` */
  unique?: boolean

  /** The collection ID of the relation. This only applies when type is `id`. */
  relation?: string

  /** `schema` only applies when type is `object` */
  schema?: Config
}

type Config = Record<string, Definition>

class Schema {
  config: Config

  constructor(config: Config) {
    this.config = config
  }

  validate(data: any) {
    return this.performValidation(data)
  }

  validateWithDefaults(data: any) {
    return this.performValidation(data, true)
  }

  private performValidation(data: any, useDefault: boolean = false) {
    const validationMap = {
      any: validateAny,
      boolean: validateBoolean,
      id: validateId,
      number: validateNumber,
      object: validateObject,
      string: validateString,
    }

    for (const [key, definition] of Object.entries(this.config)) {
      const value = data[key]
      if (
        value === undefined &&
        definition.required &&
        !definition.defaultValue
      ) {
        throw new ValidationError(key, 'field is required')
      }

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
  useDefault: boolean = false
) {
  if (typeof data.value !== 'string' && data.value !== undefined) {
    throw new ValidationError(data.name, 'value is not of type string')
  }

  if (!data.value && definition.required && !useDefault) {
    throw new ValidationError(data.name, 'an empty value was passed')
  }

  if (!data.value && useDefault) {
    return definition.defaultValue
  }

  return data.value
}

function validateNumber(
  data: Data,
  definition: Definition,
  useDefault: boolean = false
) {}

function validateBoolean(
  data: Data,
  definition: Definition,
  useDefault: boolean = false
) {}

function validateId(
  data: Data,
  definition: Definition,
  useDefault: boolean = false
) {}

function validateAny(
  data: Data,
  definition: Definition,
  useDefault: boolean = false
) {}

function validateObject(
  data: Data,
  definition: Definition,
  useDefault: boolean = false
) {}

export default Schema

export { ValidationError }

export type { Config }
