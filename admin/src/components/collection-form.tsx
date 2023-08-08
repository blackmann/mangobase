import {
  FieldValues,
  RegisterOptions,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import Field from './field'
import React from 'preact/compat'
import app from '../mangobase-app'
import { loadCollections } from '../data/collections'

interface Props {
  onHide?: VoidFunction
}

function CollectionForm({ onHide }: Props) {
  const { control, handleSubmit, register, reset } = useForm()
  const { fields, append, remove } = useFieldArray({ control, name: 'fields' })

  async function save(form: FieldValues) {
    const { name, options, fields } = form
    const data = {
      exposed: options.includes('expose'),
      name,
      schema: schemaFromForm(fields),
      template: options.includes('is-template'),
    }

    await app.addCollection(data)
    await loadCollections()

    handleOnHide()
  }

  const getFieldName = React.useCallback(() => {
    const unnamedFields = (fields as unknown as { name: string }[])
      .filter((field) => /^field\d*$/.test(field.name))
      .sort((a, b) => a.name.localeCompare(b.name))

    let fieldName = 'field1'
    let i = 0
    while (unnamedFields[i]?.name === fieldName) {
      i += 1
      fieldName = `field${i + 1}`
    }

    return fieldName
  }, [fields])

  const addNewField = React.useCallback(() => {
    append({ name: getFieldName(), type: 'string' })
  }, [append, getFieldName])

  function handleOnHide() {
    reset()
    remove()
    onHide?.()
  }

  React.useEffect(() => {
    if (!fields.length) {
      addNewField()
    }
  }, [addNewField, fields.length])

  return (
    <form onSubmit={handleSubmit(save)}>
      <label>
        Name
        <input type="text" {...register('name', { required: true })} />
      </label>

      <div>
        <label>
          <input
            checked={true}
            type="checkbox"
            value="expose"
            {...register('options')}
          />
          Expose
        </label>

        <label>
          <input type="checkbox" value="is-template" {...register('options')} />
          Use as template
        </label>
      </div>

      <fieldset>
        <legend>Fields</legend>

        {fields.map((field, i) => (
          <Field
            key={field.id}
            register={(f: string, o?: RegisterOptions) =>
              register(`fields.${i}.${f}`, o)
            }
          />
        ))}

        <button onClick={addNewField} type="button">
          Add new field
        </button>
      </fieldset>

      <footer>
        <p>
          <code>created_at</code> and <code>updated_at</code> are automatically
          set
        </p>

        <div>
          <button>Create</button>
          <button onClick={handleOnHide} type="reset">
            Cancel
          </button>
        </div>
      </footer>
    </form>
  )
}

interface FieldProps {
  name: string
  type: string
}

function schemaFromForm(fields: FieldProps[]) {
  const schema: Record<string, any> = {}
  for (const { name, ...options } of fields) {
    schema[name] = options
  }

  return schema
}

export default CollectionForm
