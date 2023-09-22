import { FieldValues, UseFieldArrayAppend } from 'react-hook-form'
import type { SchemaDefinitions } from 'mangobase'

function appendSchemaFields(
  append: UseFieldArrayAppend<FieldValues, 'fields'>,
  schema: SchemaDefinitions
) {
  for (const [field, options] of Object.entries(schema)) {
    const relation = options.type === 'id' ? options.relation : undefined
    const schema =
      options.type === 'object' || options.type === 'array'
        ? options.schema
        : undefined

    append({
      existing: true,
      name: field,
      relation,
      required: options.required,
      schema,
      type: options.type,
      unique: options.unique,
    })
  }
}

export default appendSchemaFields
