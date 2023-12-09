import type { SchemaDefinitions } from '../schema.js'

function getRefUsage(refName: string, schema: SchemaDefinitions) {
  const usage: string[][] = []

  for (const [key, definition] of Object.entries(schema)) {
    if (definition.type === 'object') {
      if (typeof definition.schema === 'string') {
        if (definition.schema === refName) {
          usage.push([key, 'schema'])
        }
        continue
      }

      const nestedUsage = getRefUsage(refName, definition.schema)
      for (const path of nestedUsage) {
        usage.push([key, 'schema', ...path])
      }
    }

    if (definition.type === 'array') {
      if (Array.isArray(definition.items)) {
        for (const [i, itemDefinition] of definition.items.entries()) {
          if (itemDefinition.type === 'object') {
            if (typeof itemDefinition.schema === 'string') {
              if (itemDefinition.schema === refName) {
                usage.push([key, 'items', i.toString(), 'schema'])
              }
              continue
            }

            const nestedUsage = getRefUsage(refName, itemDefinition.schema)
            for (const path of nestedUsage) {
              usage.push([key, 'items', i.toString(), 'schema', ...path])
            }
          }
        }
      } else if (definition.items.type === 'object') {
        if (typeof definition.items.schema === 'string') {
          if (definition.items.schema === refName) {
            usage.push([key, 'items', 'schema'])
          }
        } else {
          const nestedUsage = getRefUsage(refName, definition.items.schema)
          for (const path of nestedUsage) {
            usage.push([key, 'items', ...path])
          }
        }
      }
    }
  }

  return usage
}

export { getRefUsage }
