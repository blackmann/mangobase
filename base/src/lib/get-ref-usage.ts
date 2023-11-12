import type { SchemaDefinitions } from '../schema.js'

function getRefUsage(refName: string, schema: SchemaDefinitions) {
  const usage: string[][] = []

  for (const [key, value] of Object.entries(schema)) {
    if (value.type === 'object') {
      if (typeof value.schema === 'string') {
        if (value.schema === refName) {
          usage.push([key])
        }
        continue
      }

      const nestedUsage = getRefUsage(refName, value.schema)
      for (const path of nestedUsage) {
        usage.push([key, ...path])
      }
    }

    if (value.type === 'array') {
      if (Array.isArray(value.items)) {
        for (const [i, itemDefinition] of value.items.entries()) {
          if (itemDefinition.type === 'object') {
            if (typeof itemDefinition.schema === 'string') {
              if (itemDefinition.schema === refName) {
                usage.push([key, i.toString()])
              }
              continue
            }

            const nestedUsage = getRefUsage(refName, itemDefinition.schema)
            for (const path of nestedUsage) {
              usage.push([key, i.toString(), ...path])
            }
          }
        }
      } else if (value.items.type === 'object') {
        if (typeof value.items.schema === 'string') {
          if (value.items.schema === refName) {
            usage.push([key])
          }
        } else {
          const nestedUsage = getRefUsage(refName, value.items.schema)
          for (const path of nestedUsage) {
            usage.push([key, ...path])
          }
        }
      }
    }
  }

  return usage
}

export { getRefUsage }
