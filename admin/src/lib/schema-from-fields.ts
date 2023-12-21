import type { FieldProps } from '@/components/collection-form'
import { definitionFromField } from './definition-from-field'

function schemaFromFields(fields: FieldProps[]) {
  const schema: Record<string, any> = {}
  for (const field of fields) {
    if (field.removed) {
      continue
    }

    const [name, definition] = definitionFromField(field)

    if (definition.type === 'string') {
      if (definition.enum) {
        if (definition.enum.length === 0) {
          // remove empty enum list
          definition.enum = undefined
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          definition.enum = definition.enum.map((it) => it.text)
        }
      }
    }

    schema[name] = definition
  }

  return schema
}

export { schemaFromFields }
