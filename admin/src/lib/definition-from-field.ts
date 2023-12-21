import { FieldProps } from '@/components/collection-form'

function definitionFromField(field: FieldProps) {
  const { name, existing, removed, ...definition } = field
  return [name, definition] as const
}

export { definitionFromField }
