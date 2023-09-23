import type { SchemaDefinitions } from '../schema'

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
      if (value.schema.item.type === 'object') {
        if (typeof value.schema.item.schema === 'string') {
          if (value.schema.item.schema === refName) {
            usage.push([key])
          }
        } else {
          const nestedUsage = getRefUsage(refName, value.schema.item.schema)
          for (const path of nestedUsage) {
            usage.push([key, ...path])
          }
        }
      }
    }
  }

  return usage
}

export default getRefUsage
