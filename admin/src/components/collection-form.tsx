import {
  FieldValues,
  RegisterOptions,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import Field from './field'
import { Link } from 'react-router-dom'
import React from 'preact/compat'
import app from '../mangobase-app'
import { loadCollections } from '../data/collections'
import styles from './collection-form.module.css'

interface Props {
  onHide?: VoidFunction
}

function CollectionForm({ onHide }: Props) {
  const { control, handleSubmit, register, reset, watch } = useForm()
  const { fields, append, remove } = useFieldArray({ control, name: 'fields' })

  function handleRemove(index: number) {
    remove(index)
  }

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
    <form className={styles.form} onSubmit={handleSubmit(save)}>
      <label>
        <div>Name</div>
        <input
          className="d-block w-100"
          type="text"
          {...register('name', { required: true })}
        />
      </label>

      <div className="row mt-3">
        <div className="col-md-6">
          <label>
            <input
              checked={true}
              type="checkbox"
              value="expose"
              {...register('options')}
            />
            Expose
          </label>

          <p className="text-secondary mt-0 ms-4">
            Check this if this collection should have a public endpoint. See{' '}
            <Link to="/docs">docs</Link>
          </p>
        </div>

        <div className="col-md-6">
          <label>
            <input
              type="checkbox"
              value="is-template"
              {...register('options')}
            />
            Use as template
          </label>

          <p className="text-secondary mt-0 ms-4">
            Allow this collection to be used to validate fields of other
            collections
          </p>
        </div>
      </div>

      <fieldset className="mt-3">
        <legend>Fields</legend>

        {fields.map((field, i) => (
          <Field
            key={field.id}
            onRemove={() => handleRemove(i)}
            register={(f: string, o?: RegisterOptions) =>
              register(`fields.${i}.${f}`, o)
            }
            watch={(key) => watch(`fields.${i}.${key}`)}
          />
        ))}

        <button className="mt-3" onClick={addNewField} type="button">
          Add new field
        </button>
      </fieldset>

      <footer>
        <p>
          <code>created_at</code> and <code>updated_at</code> fields are
          automatically set
        </p>

        <div>
          <button className="primary">Create</button>
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
