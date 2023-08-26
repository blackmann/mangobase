import {
  FieldValues,
  RegisterOptions,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import Field from './field'
import { FieldType } from '../lib/field-types'
import { Link } from 'react-router-dom'
import React from 'preact/compat'
import app from '../mangobase-app'
import { loadCollections } from '../data/collections'
import styles from './collection-form.module.css'

interface ExistingCollection {
  exposed: boolean
  name: string
  schema: Record<string, any>
  template: boolean
}

interface Props {
  onHide?: VoidFunction
  collection?: ExistingCollection
}

interface FieldProps {
  existing?: boolean
  name: string
  required: boolean
  type: FieldType
  unique?: boolean
}

function CollectionForm({ collection, onHide }: Props) {
  const { control, handleSubmit, register, reset, setValue, watch } = useForm()
  const { fields, append, remove } = useFieldArray({ control, name: 'fields' })

  function handleRemove(index: number) {
    const field = fields[index] as unknown as FieldProps
    if (field.existing) {
      setValue(`fields.${index}.removed`, true)
      return
    }

    remove(index)
  }

  async function save(form: FieldValues) {
    const { name, options, fields } = form

    const migrationSteps = []

    if (collection) {
      if (name !== collection.name) {
        migrationSteps.push({ to: name, type: 'rename-collection' })
      }
    }

    const data = {
      exposed: options.includes('expose'),
      migrationSteps,
      name,
      schema: schemaFromForm(fields),
      template: options.includes('is-template'),
    }

    if (collection) {
      await app.editCollection(collection.name, data)
    } else {
      await app.addCollection(data)
    }

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
    if (!collection) return

    setValue('name', collection.name)
    setValue('exposed', collection.exposed)

    for (const [field, options] of Object.entries(collection.schema)) {
      append({
        existing: true,
        name: field,
        required: options.required,
        type: options.type,
        unique: options.unique,
      })
    }
  }, [append, collection, setValue])

  React.useEffect(() => {
    if (collection || fields.length) {
      return
    }

    addNewField()
  }, [addNewField, collection, fields])

  const submitLabel = collection ? 'Update' : 'Create'

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
          <button className="primary">{submitLabel}</button>
          <button onClick={handleOnHide} type="reset">
            Cancel
          </button>
        </div>
      </footer>
    </form>
  )
}

function schemaFromForm(fields: FieldProps[]) {
  const schema: Record<string, any> = {}
  for (const { name, ...options } of fields) {
    schema[name] = options
  }

  return schema
}

export default CollectionForm
