function getNewFieldName(fields: { name: string }[]) {
  const unnamedFields = fields
    .filter((field) => /^field\d*$/.test(field.name))
    .sort((a, b) => a.name.localeCompare(b.name))

  let fieldName = 'field1'
  let i = 0
  while (unnamedFields[i]?.name === fieldName) {
    i += 1
    fieldName = `field${i + 1}`
  }

  return fieldName
}

export default getNewFieldName
