const types = [
  'any',
  'array',
  'boolean',
  'date',
  'id',
  'number',
  'object',
  'string',
] as const

type DefinitionType = `${(typeof types)[number]}`

type RefName = string

type GetRef = (name: string) => SchemaDefinitions | undefined

interface StringDefinition {
  type: 'string'
  treatAs?: 'email' | 'url' | 'code'
  defaultValue?: string
}

interface NumberDefinition {
  type: 'number'
  defaultValue?: number
}

/** `id` values are always of the primitive type `string`.
 * Database adapters may need to convert to appropriate types.
 * When type is `id`, `relation` is required
 * */
interface IdDefinition {
  type: 'id'
  /** The collection ID of the relation. This only applies when type is `id`. */
  relation: string
  defaultValue?: string
}

interface BooleanDefinition {
  type: 'boolean'
  unique?: false
  defaultValue?: boolean
}

interface ObjectDefinition {
  type: 'object'
  defaultValue?: object
  schema: RefName | SchemaDefinitions
}

interface ArrayDefinition {
  type: 'array'
  // Nested into `item` because we can expect primitives (non-objects)
  schema: RefName | { item: Definition }
  defaultValue?: Array<any>
}

interface DateDefinition {
  type: 'date'
  defaultValue?: string
}

interface AnyDefinition {
  type: 'any'
  defaultValue?: any
}

type Definition = {
  description?: string

  required?: boolean

  /** `unique` constraints do not apply to type of `any`. Currently, the schema
   * does not enforce uniqueness; it's not its responsibility. Maybe this field
   * is redundant and will be removed in future.
   */
  unique?: boolean
} & (
  | AnyDefinition
  | ArrayDefinition
  | BooleanDefinition
  | DateDefinition
  | IdDefinition
  | NumberDefinition
  | ObjectDefinition
  | StringDefinition
)

type SchemaDefinitions = Record<string, Definition>
interface Options {
  /**
   * Parsers are used to convert incoming values to formats that the database _prefers_.
   * For example, Mongo IDs are supposed to be `mongo.ObjectId`s. So a parser may be defined
   *
   */
  parser?: (value: any, type: DefinitionType) => any

  /**
   * This function is called when the
   */
  getRef?: GetRef
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
  getRef?: GetRef

  constructor(schema: SchemaDefinitions, options: Options = {}) {
    this.schema = schema
    this.getRef = options.getRef
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
            break
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

        case 'id': {
          if (typeof value === 'object') {
            this.castOperatorValues(value, 'id', (value) => value)
            break
          }

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

  validate(data: any, useDefault = false, ignoreMissing = false) {
    if (!data) {
      throw new Error('`data` is undefined')
    }

    const res = structuredClone(data)

    for (const [key, definition] of Object.entries(this.schema)) {
      const value = res[key]

      if (value === undefined && ignoreMissing) {
        continue
      }

      let validatedValue
      switch (definition.type) {
        case 'any': {
          validatedValue = this.validateAny(
            { name: key, value },
            definition,
            useDefault
          )
          break
        }

        case 'array': {
          validatedValue = this.validateArray(
            { name: key, value },
            definition,
            useDefault
          )
          break
        }

        case 'boolean': {
          validatedValue = this.validateBoolean(
            { name: key, value },
            definition,
            useDefault
          )
          break
        }

        case 'date': {
          validatedValue = this.validateDate(
            { name: key, value },
            definition,
            useDefault
          )
          break
        }

        case 'id': {
          validatedValue = this.validateId(
            { name: key, value },
            definition,
            useDefault
          )
          break
        }

        case 'number': {
          validatedValue = this.validateNumber(
            { name: key, value },
            definition,
            useDefault
          )
          break
        }

        case 'object': {
          validatedValue = this.validateObject(
            { name: key, value },
            definition,
            useDefault
          )
          break
        }

        case 'string': {
          validatedValue = this.validateString(
            { name: key, value },
            definition,
            useDefault
          )
          break
        }
      }

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
      return new Schema(
        getSchemaDefinition(definition, this.getRef)
      ).getDefinitionAtPath(rest.join('.'))
    }

    // Returning undefined because there's more segments to resolve (from ...rest)
    // but they're neither an object or array in the schema
    return undefined
  }

  private validateString(
    data: Data,
    definition: Extract<Definition, { type: 'string' }>,
    useDefault = false
  ) {
    if (data.value === undefined || data.value === '') {
      if (useDefault && definition.defaultValue) {
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
    definition: Extract<Definition, { type: 'number' }>,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault && definition.defaultValue !== undefined) {
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
    definition: Extract<Definition, { type: 'boolean' }>,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault && definition.defaultValue !== undefined) {
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

  private validateId(
    data: Data,
    definition: Extract<Definition, { type: 'id' }>,
    useDefault = false
  ) {
    return this.validateString(
      data,
      definition as unknown as Extract<Definition, { type: 'string' }>,
      useDefault
    )
  }

  private validateAny(
    data: Data,
    definition: Extract<Definition, { type: 'any' }>,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault && definition.defaultValue !== undefined) {
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
    definition: Extract<Definition, { type: 'object' }>,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault && definition.defaultValue !== undefined) {
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

    const schemaDefinitions = getSchemaDefinition(definition, this.getRef)

    const schema = new Schema(schemaDefinitions, {
      getRef: this.getRef,
      parser: this.parser,
    })

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
    definition: Extract<Definition, { type: 'array' }>,
    useDefault = false
  ) {
    if (data.value === undefined) {
      if (useDefault && definition.defaultValue !== undefined) {
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

    const schema = new Schema(getSchemaDefinition(definition, this.getRef), {
      parser: this.parser,
    })

    return data.value.map((item) => {
      return schema.validate({ item }).item
    })
  }

  private validateDate(data: Data, definition: Definition, useDefault = false) {
    if (data.value === undefined) {
      if (useDefault && definition.defaultValue !== undefined) {
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

  static validateSchema(schema: any, parentField?: string) {
    if (typeof schema !== 'object' || Array.isArray(schema)) {
      throw new Error('schema has to be an object')
    }

    for (const [name, definition] of Object.entries(
      schema as Record<string, any>
    )) {
      const fieldPath = parentField ? `${parentField}.${name}` : name
      const type = definition?.type
      if (!types.includes(type)) {
        throw new ValidationError(fieldPath, '`type` is invalid or undefined')
      }

      switch (type) {
        case 'array': {
          if (
            typeof definition.schema !== 'object' ||
            Array.isArray(definition.schema)
          ) {
            throw new ValidationError(
              fieldPath,
              '`schema` is required when type is `array`'
            )
          }

          if (!definition.schema.item) {
            throw new ValidationError(
              fieldPath,
              '`schema` should be in the format `{ item: { type: "string" | ... } }'
            )
          }

          Schema.validateSchema(definition.schema, fieldPath)

          // validate the default values
          if (definition.defaultValue) {
            if (!Array.isArray(definition.defaultValue)) {
              throw new ValidationError(
                fieldPath,
                '`defaultValue` should be an array'
              )
            }

            const itemSchema = new Schema(definition.schema)
            let index = 0
            for (const value of definition.defaultValue) {
              try {
                itemSchema.validate(value)
                index += 1
              } catch (err) {
                if (err instanceof ValidationError) {
                  err.field = `${fieldPath}.${index}.${err.field}`
                  throw err
                }

                throw err
              }
            }
          }

          break
        }

        case 'boolean': {
          if (
            typeof definition.defaultValue !== 'undefined' &&
            typeof definition.defaultValue !== 'boolean'
          ) {
            throw new ValidationError(
              fieldPath,
              '`defaultValue` should be a boolean'
            )
          }

          break
        }

        case 'date': {
          if (
            definition.defaultValue &&
            isNaN(new Date(definition.value).getTime())
          ) {
            throw new ValidationError(
              fieldPath,
              '`defaultValue` should be a valid date'
            )
          }
          break
        }
        case 'id': {
          if (
            definition.defaultValue &&
            typeof definition.defaultValue !== 'string'
          ) {
            throw new ValidationError(
              fieldPath,
              '`defaultValue` should be a string'
            )
          }

          if (!definition.relation) {
            throw new ValidationError(
              fieldPath,
              '`relation` is required for type `id`'
            )
          }

          break
        }
        case 'number': {
          if (
            definition.defaultValue &&
            typeof definition.defaultValue !== 'number'
          ) {
            throw new ValidationError(
              fieldPath,
              '`defaultValue` should be a number'
            )
          }

          break
        }

        case 'object': {
          if (
            typeof definition.schema !== 'object' ||
            Array.isArray(definition.schema)
          ) {
            throw new ValidationError(
              fieldPath,
              '`schema` is required when type is `array`'
            )
          }

          if (definition.defaultValue) {
            if (
              typeof definition.defaultValue !== 'object' ||
              Array.isArray(definition.defaultValue)
            ) {
              throw new ValidationError(
                fieldPath,
                '`defaultValue` should be an object'
              )
            }

            new Schema(definition.schema).validate(definition.defaultValue)
          }

          //

          break
        }

        case 'string': {
          if (
            definition.defaultValue &&
            typeof definition.defaultValue !== 'string'
          ) {
            throw new ValidationError(
              fieldPath,
              '`defaultValue` should be a string'
            )
          }

          break
        }
      }
    }
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

function getSchemaDefinition(
  definition: Extract<Definition, { type: 'object' } | { type: 'array' }>,
  getRef?: GetRef
) {
  let schemaDefinitions: SchemaDefinitions

  if (typeof definition.schema === 'string') {
    if (!getRef) {
      throw new Error('`getRef` is required when schema is a string.')
    }

    const definitions = getRef(definition.schema)
    if (!definitions) {
      throw new Error(`Schema ref with name \`${definition.schema}\` not found`)
    }

    schemaDefinitions = definitions
  } else {
    schemaDefinitions = definition.schema
  }

  return schemaDefinitions
}

/**
 * Returns all field paths where the collection with `name` is used
 * @param name the collection name
 * @returns An array of paths to the field. Eg, [['city', 'town']] => 'city.town'
 */
function findRelations(
  schema: SchemaDefinitions,
  name: string,
  getRef?: GetRef
) {
  function find(s = schema, path: string[] = []) {
    const res: string[][] = []

    for (const [field, definition] of Object.entries(s)) {
      if (
        (definition.type === 'object' || definition.type === 'array') &&
        definition.schema
      ) {
        const nested = find(getSchemaDefinition(definition, getRef), path)
        res.push(...nested)
      }

      if (definition.type !== 'id') {
        continue
      }

      if (definition.relation === name) {
        res.push([...path, field])
      }
    }

    return res
  }

  return find()
}

export default Schema

export { ValidationError, findRelations }

export type { SchemaDefinitions, Definition, DefinitionType }
