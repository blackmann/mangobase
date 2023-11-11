import { SchemaDefinitions } from '../schema'

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
} & TypescriptOptions

async function exportSchema(options: Options) {
  const { language } = options
  switch (language) {
    case 'typescript': {
      const [definition, includes] = await exportToTypescript(options)
      return [definition, Object.values(includes).join('\n')].join('\n\n')
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

const defaultState = { includeName: true, includes: {}, tabs: 2 }

async function exportToTypescript(
  options: Omit<Extract<Options, { language: 'typescript' }>, 'language'>,
  state: TypescriptExportState = defaultState
): Promise<[string, Record<TypeName, Structure>]> {
  const {
    name,
    schema,
    getRef,
    inlineObjectSchema,
    includeObjectSchema: objectSchema,
  } = options

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
        const objectName =
          typeof definition.schema === 'string'
            ? getSchemaName(definition.schema)
            : field

        const typeName = toPascalCase(objectName)

        if (!objectSchema) {
          lines.push(i`${field}: ${typeName}`)
          break
        }

        const schema =
          typeof definition.schema === 'string'
            ? await getRef(definition.schema)
            : definition.schema

        if (inlineObjectSchema) {
          const [objectDefinition, innerIncludes] = await exportToTypescript(
            {
              getRef,
              name: typeName,
              schema,
            },
            { includeName: false, tabs: tabs + 2 }
          )

          lines.push(i`${field}: ${objectDefinition}`)
          Object.assign(includes, innerIncludes)

          break
        } else {
          const [definition, innerIncludes] = await exportToTypescript({
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

function toPascalCase(name: string) {
  return name
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')
}

function getSchemaName(name: string) {
  const parts = name.split('_')
  const schemaName = parts.pop()

  return schemaName!
}

export { exportSchema }
