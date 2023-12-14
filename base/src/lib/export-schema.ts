import type {
  Definition,
  SchemaDefinitions,
  DefinitionType,
} from '../schema.js'

interface TypescriptOptions {
  language: 'typescript'
  /** Whether to include schema definitions for object types */
  includeObjectSchema?: boolean
  /** Whether object definitions should be inline */
  inlineObjectSchema?: boolean
}

interface Result {
  name: string
  definition: string
  includes: Record<string, string>
}

type Options = {
  name: string
  schema: SchemaDefinitions
  getRef: (ref: string) => Promise<SchemaDefinitions>
} & TypescriptOptions

async function exportSchema(options: Options) {
  const { language } = options
  switch (language) {
    case 'typescript': {
      return await exportToTypescript(options)
    }

    default:
      throw new Error(`Unsupported language: ${language}`)
  }
}

type TypeName = string
type Structure = string

type TypescriptExportState = {
  tabs: number
  includeName: boolean
  top: boolean
}

const defaultState = { includeName: true, tabs: 2, top: true }

async function exportToTypescript(
  options: Extract<Options, { language: 'typescript' }>,
  state: TypescriptExportState = defaultState
): Promise<Result> {
  const { name, schema, getRef, inlineObjectSchema, includeObjectSchema } =
    options

  const { tabs, includeName } = state

  const lines = []
  // [ ]: Improve this so that includes are shared between recursive calls
  const includes: Record<TypeName, Structure> = {}
  const leading = ' '.repeat(tabs - 2)
  const spacing = ' '.repeat(tabs)

  function i(strings: TemplateStringsArray, ...values: any[]): string {
    let result = ''
    for (let i = 0; i < strings.length; i++) {
      result += strings[i] + (values[i] || '')
    }
    return spacing + result
  }

  const typeName = toPascalCase(name)
  if (includeName) {
    lines.push(`interface ${typeName} {`)
  } else {
    lines.push('{')
  }

  if (state.top) {
    lines.push(i`_id: string`)
  }

  for (const [fieldName, definition] of Object.entries(schema)) {
    const type = definition.type

    const field = definition.required ? fieldName : `${fieldName}?`

    switch (type) {
      case 'array': {
        // [ ]: Handle tuples
        if (Array.isArray(definition.items)) {
          continue
        }

        const items = definition.items as Definition
        switch (items.type) {
          case 'array': {
            // [ ]: Handle nested array
            break
          }

          case 'date': {
            lines.push(i`${field}: Date[]`)
            break
          }

          case 'id': {
            lines.push(i`${field}: string[]`)
            break
          }

          case 'object': {
            const typeName = getObjectTypeName(items, field)
            if (!includeObjectSchema) {
              lines.push(i`${field}: ${typeName}[]`)
              break
            }

            const schema =
              typeof items.schema === 'string'
                ? await getRef(items.schema)
                : items.schema

            if (inlineObjectSchema) {
              const { definition: objectDefinition } = await exportToTypescript(
                {
                  ...options,
                  name: typeName,
                  schema,
                },
                { includeName: false, tabs: tabs + 2, top: false }
              )

              lines.push(i`${field}: ${objectDefinition}[]`)

              break
            } else {
              const { definition, includes: innerIncludes } =
                await exportToTypescript(
                  {
                    ...options,
                    getRef,
                    name: typeName,
                    schema,
                  },
                  { ...defaultState, top: false }
                )

              includes[typeName] = definition
              Object.assign(includes, innerIncludes)

              lines.push(i`${field}: ${typeName}[]`)
              break
            }
          }

          default: {
            lines.push(i`${field}: ${items.type}[]`)
          }
        }
        break
      }

      case 'date': {
        lines.push(i`${field}: Date`)
        break
      }

      case 'id': {
        lines.push(i`${field}: string`)
        break
      }

      case 'object': {
        const typeName = getObjectTypeName(definition, field)

        if (!includeObjectSchema) {
          lines.push(i`${field}: ${typeName}`)
          break
        }

        const schema =
          typeof definition.schema === 'string'
            ? await getRef(definition.schema)
            : definition.schema

        if (inlineObjectSchema) {
          const { definition: objectDefinition } = await exportToTypescript(
            {
              ...options,
              name: typeName,
              schema,
            },
            { includeName: false, tabs: tabs + 2, top: false }
          )

          lines.push(i`${field}: ${objectDefinition}`)

          break
        } else {
          const { definition, includes: innerIncludes } =
            await exportToTypescript(
              {
                ...options,
                getRef,
                name: typeName,
                schema,
              },
              { ...defaultState, top: false }
            )

          includes[typeName] = definition
          Object.assign(includes, innerIncludes)

          lines.push(i`${field}: ${typeName}`)
          break
        }
      }
      case 'string': {
        if (definition.enum) {
          lines.push(i`${field}: ${definition.enum.map(e => (e)).join(' | ')}`)
          break
        }
        lines.push(i`${field}: ${type}`)
      }
      default: {
        lines.push(i`${field}: ${type}`)
      }
    }
  }

  lines.push(`${leading}}`)

  const definition = lines.join('\n')
  return { definition, includes, name: typeName }
}

function getObjectTypeName(
  definition: Extract<Definition, { type: 'object' }>,
  field: string
) {
  const objectName =
    typeof definition.schema === 'string'
      ? getSchemaName(definition.schema)
      : field

  const typeName = toPascalCase(objectName)
  return typeName
}

function toPascalCase(name: string) {
  return name
    .split(/[-_]/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')
}

function getSchemaName(name: string) {
  const parts = name.split('_')
  const schemaName = parts.pop()

  return schemaName!
}

export { exportSchema }
export type { Options as ExportOptions, Result as ExportResult }
