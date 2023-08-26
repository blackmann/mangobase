const fieldTypes = [
  { title: 'string', value: 'string' },
  { title: 'number', value: 'number' },
  { title: 'boolean', value: 'boolean' },
  { title: 'relation', value: 'id' },
  { title: 'date', value: 'date' },
  { title: 'array', value: 'array' },
  { title: 'object', value: 'object' },
  { title: 'any', value: 'any' },
] as const

type FieldType = `${(typeof fieldTypes)[number]['value']}`

export default fieldTypes
export type { FieldType }
