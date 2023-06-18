import { useFieldArray, useForm } from 'react-hook-form'
import Field from './field'
import React from 'preact/compat'

interface Props {
  onHide?: VoidFunction
}

function CollectionForm({ onHide }: Props) {
  const { control, handleSubmit, register, reset } = useForm()
  const { fields, append, remove } = useFieldArray({ control, name: 'fields' })

  function addNewField() {
    append({ name: getFieldName(), type: 'string' })
  }

  function save() {}

  function getFieldName() {
    const unnamedFields = (fields as unknown as {name: string}[])
      .filter((field) => /^field\d*$/.test(field.name))
      .sort((a, b) => a.name.localeCompare(b.name))

    let fieldName = 'field1'
    let i = 0
    while (unnamedFields[i]?.name === fieldName) {
      i += 1
      fieldName = 'field' + (i + 1)
    }

    return fieldName
  }

  function handleOnHide() {
    reset()
    remove()
    onHide?.()
  }

  React.useEffect(() => {
    if (!fields.length) {
      addNewField()
    }
  }, [addNewField])

  return (
    <form onSubmit={handleSubmit(save)}>
      <label>
        Name
        <input type="text" {...register('name', { required: true })} />
      </label>

      <div>
        <label>
          <input type="checkbox" {...register('expose')} />
          Expose
        </label>

        <label>
          <input type="checkbox" {...register('expose')} />
          Use as template
        </label>
      </div>

      <fieldset>
        <legend>Fields</legend>

        {fields.map((field, i) => (
          <Field
            key={field.id}
            register={(f: string) => register(`fields.${i}.${f}`)}
          />
        ))}

        <button onClick={addNewField} type="button">
          Add new field
        </button>
        <footer>
          <p>
            <code>created_at</code> and <code>updated_at</code> are
            automatically set
          </p>

          <div>
            <button>Create</button>
            <button onClick={handleOnHide} type="reset">Cancel</button>
          </div>
        </footer>
      </fieldset>
    </form>
  )
}

export default CollectionForm
