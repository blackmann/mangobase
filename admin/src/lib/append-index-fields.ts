import type { FieldValues, UseFieldArrayAppend } from 'react-hook-form'
import { Index } from 'mangobase'
import { slugify } from './slugify'

function appendIndexFields(
  append: UseFieldArrayAppend<FieldValues, 'indexes'>,
  indexes: Index[]
) {
  for (const index of indexes) {
    append({
      constraint: index.options.unique
        ? 'unique'
        : index.options.sparse
        ? 'sparse'
        : 'none',
      fields: index.fields.map((field) => {
        if (typeof field === 'string') {
          return {
            id: slugify(field),
            sort: 1,
            text: field,
          }
        }

        return {
          id: slugify(field[0]),
          sort: field[1],
          text: field[0],
        }
      }),
    })
  }
}

export { appendIndexFields }
