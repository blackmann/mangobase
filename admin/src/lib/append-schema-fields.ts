import { FieldValues, UseFieldArrayAppend } from 'react-hook-form'
import type { SchemaDefinitions } from 'mangobase'

function appendSchemaFields(
  append: UseFieldArrayAppend<FieldValues, 'fields'>,
  schema: SchemaDefinitions
) {
  for (const [field, options] of Object.entries(schema)) {
    const relation = options.type === 'id' ? options.relation : undefined

    append({
      existing: true,
      name: field,
      relation,
      required: options.required,
      type: options.type,
      unique: options.unique,
    })
  }
}

export default appendSchemaFields
