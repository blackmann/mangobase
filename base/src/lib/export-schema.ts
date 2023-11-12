import type { Definition, SchemaDefinitions } from '../schema.js'

interface TypescriptOptions {
  language: 'typescript'
  /** Whether to include schema definitions for object types */
  includeObjectSchema?: boolean
  /** Whether object definitions should be inline */
  inlineObjectSchema?: boolean
}

type Options = {
  name: string
  schema: SchemaDefinitions
  getRef: (ref: string) => Promise<SchemaDefinitions>
  render?: boolean
} & TypescriptOptions

async function exportSchema(options: Options) {
  const { language, render = true } = options
  switch (language) {
    case 'typescript': {
      const [definition, includes] = await exportToTypescript(options)
      return render
        ? [definition, Object.values(includes).join('\n\n')].join('\n\n')
        : { definition, includes }
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
}

const defaultState = { includeName: true, tabs: 2 }

async function exportToTypescript(
  options: Omit<Extract<Options, { language: 'typescript' }>, 'language'>,
  state: TypescriptExportState = defaultState
): Promise<[string, Record<TypeName, Structure>]> {
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

  if (includeName) {
    lines.push(`interface ${toPascalCase(name)} {`)
  } else {
    lines.push('{')
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
              const [objectDefinition] = await exportToTypescript(
                {
                  ...options,
                  name: typeName,
                  schema,
                },
                { includeName: false, tabs: tabs + 2 }
              )

              lines.push(i`${field}: ${objectDefinition}[]`)

              break
            } else {
              const [definition, innerIncludes] = await exportToTypescript({
                ...options,
                getRef,
                name: typeName,
                schema,
              })

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
          const [objectDefinition] = await exportToTypescript(
            {
              ...options,
              name: typeName,
              schema,
            },
            { includeName: false, tabs: tabs + 2 }
          )

          lines.push(i`${field}: ${objectDefinition}`)

          break
        } else {
          const [definition, innerIncludes] = await exportToTypescript({
            ...options,
            getRef,
            name: typeName,
            schema,
          })

          includes[typeName] = definition
          Object.assign(includes, innerIncludes)

          lines.push(i`${field}: ${typeName}`)
          break
        }
      }

      default: {
        lines.push(i`${field}: ${type}`)
      }
    }
  }

  lines.push(`${leading}}`)

  const definitionRender = lines.join('\n')
  return [definitionRender, includes]
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
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')
}

function getSchemaName(name: string) {
  const parts = name.split('_')
  const schemaName = parts.pop()

  return schemaName!
}

export { exportSchema }