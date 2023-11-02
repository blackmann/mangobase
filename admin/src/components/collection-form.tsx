import {
  FieldValues,
  RegisterOptions,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import Button from './button'
import Collection from '../client/collection'
import Field from './field'
import { FieldType } from '../lib/field-types'
import Input from './input'
import { Link } from 'react-router-dom'
import React from 'preact/compat'
import app from '../mangobase-app'
import appendSchemaFields from '../lib/append-schema-fields'
import getNewFieldName from '../lib/get-new-field-name'
import indexed from '../lib/indexed'
import { loadCollections } from '../data/collections'
import { ControlledChipsInput } from './chips-input'

interface Props {
  onHide?: (collection?: Collection) => void
  collection?: Collection
}

interface FieldProps {
  existing?: boolean
  name: string
  required: boolean
  removed?: boolean
  type: FieldType
  unique?: boolean
}

const SLUG_REGEX = /^[A-Za-z0-9_]+(?:-[A-Za-z0-9]+)*$/

function CollectionForm({ collection, onHide }: Props) {
  const {
    control,
    formState,
    getFieldState,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm()
  const { fields, append, remove } = useFieldArray({ control, name: 'fields' })

  const [submitting, setSubmitting] = React.useState(false)

  function handleRemove(index: number) {
    const field = fields[index] as unknown as FieldProps
    if (field.existing) {
      setValue(`fields.${index}.removed`, true)
      return
    }

    remove(index)
  }

  function handleRestore(index: number) {
    setValue(`fields.${index}.removed`, false)
  }

  async function submitForm(form: FieldValues) {
    if (submitting || collection?.readOnlySchema) {
      return
    }

    try {
      setSubmitting(true)
      await save(form)
    } catch (err) {
      setSubmitting(false)
    }
  }

  async function save(form: FieldValues) {
    const { name, options, fields } = form

    const migrationSteps = []

    if (collection) {
      if (name !== collection.name) {
        migrationSteps.push({
          collection: collection.name,
          to: name,
          type: 'rename-collection',
        })
      }

      const oldFields = Object.entries(collection.schema)
      for (const [field, i] of indexed(fields as FieldProps[])) {
        if (i >= oldFields.length) {
          break
        }

        const [oldName] = oldFields[i]
        if (field.removed) {
          migrationSteps.push({
            collection: collection.name,
            name: oldName,
            type: 'remove-field',
          })
          continue
        }

        if (oldName !== field.name) {
          migrationSteps.push({
            collection: collection.name,
            from: oldName,
            to: field.name,
            type: 'rename-field',
          })
        }
      }
    }

    const data = {
      exposed: options.includes('expose'),
      indexes: indexesFromForm(fields),
      migrationSteps,
      name,
      schema: schemaFromForm(fields),
      template: options.includes('is-template'),
    }

    const newCollection = collection
      ? await app.editCollection(collection.name, data)
      : await app.addCollection(data)

    await loadCollections()

    handleOnHide(newCollection)
  }

  const addNewField = React.useCallback(() => {
    append({
      name: getNewFieldName(fields as unknown as { name: string }[]),
      type: 'string',
    })
  }, [append, fields])

  function handleOnHide(collection?: Collection) {
    reset()
    remove()
    onHide?.(collection)
  }

  React.useEffect(() => {
    if (!collection) return

    setValue('name', collection.name)

    const options: string[] = []
    if (collection.exposed) {
      options.push('expose')
    }

    if (collection.template) {
      options.push('is-template')
    }

    setValue('options', options)

    // for some reason, when developing, updating this component causes
    // the fields to repeat themselves. remove() clears old insertions
    remove()

    appendSchemaFields(append, collection.schema)
  }, [append, collection, remove, setValue])

  React.useEffect(() => {
    if (collection || fields.length) {
      return
    }

    addNewField()
  }, [addNewField, collection, fields])

  const submitLabel = collection ? 'Updated' : 'Create'

  return (
    <form className="w-[500px] pb-4" onSubmit={handleSubmit(submitForm)}>
      <label>
        <div>Name</div>
        <Input
          className="block w-full"
          type="text"
          {...register('name', {
            pattern: SLUG_REGEX,
            required: true,
          })}
        />
      </label>

      <div className="text-secondary">
        This becomes endpoint name.{' '}
        {getFieldState('name', formState).error && (
          <span className="text-red-500 dark:text-orange-400 mt-1">
            Name must be a valid slug.
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-12">
        <div className="col-span-6">
          <label>
            <Input
              checked={true}
              type="checkbox"
              value="expose"
              {...register('options')}
              className="me-2"
            />
            Expose
          </label>

          <p className="text-secondary ms-7">
            Check this if this collection should have a public endpoint. See{' '}
            <Link to="/docs" className="underline">
              docs
            </Link>
            .
          </p>
        </div>

        <div className="col-span-6">
          <label>
            <Input
              type="checkbox"
              value="is-template"
              {...register('options')}
              className="me-2"
            />
            Use as template
          </label>

          <p className="text-secondary mt-0 ms-7">
            Allow this collection to be used to validate fields of other
            collections
          </p>
        </div>
      </div>

      {collection?.readOnlySchema && (
        <div className="bg-zinc-200 dark:bg-neutral-700 my-5 rounded-md p-2 flex">
          <span className="material-symbols-rounded text-blue-500 dark:text-blue-300 me-2 text-base">
            error
          </span>
          <p>
            This collection's schema is read-only and controlled by the plugin
            that installed it.
          </p>
        </div>
      )}

      <fieldset className="mt-8">
        <legend className="font-medium">Fields</legend>

        {fields.map((field, i) => (
          <Field
            key={field.id}
            onRemove={() => handleRemove(i)}
            onRestore={() => handleRestore(i)}
            register={(f: string, o?: RegisterOptions) =>
              register(`fields.${i}.${f}`, o)
            }
            watch={(f) => watch(`fields.${i}.${f}`)}
          />
        ))}

        <Button className="mt-3" onClick={addNewField} type="button">
          Add new field
        </Button>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="font-medium">Indexes</legend>

        <ControlledChipsInput control={control} name="indexes" />
      </fieldset>

      <footer>
        <p className="my-8">
          <code className="py-0">created_at</code> and{' '}
          <code className="py-0">updated_at</code> fields are automatically set
        </p>

        <div>
          <Button
            className="me-2"
            disabled={submitting || collection?.readOnlySchema}
            variant="primary"
          >
            {submitLabel}
          </Button>
          <Button onClick={() => handleOnHide()} type="reset">
            Cancel
          </Button>
        </div>
      </footer>
    </form>
  )
}

function schemaFromForm(fields: FieldProps[]) {
  const schema: Record<string, any> = {}
  // `existing` doesn't go to backend
  for (const { name, removed, existing, ...options } of fields) {
    if (removed) {
      continue
    }

    schema[name] = options
  }

  return schema
}

function indexesFromForm(fields: FieldProps[]) {
  const indexes = []
  for (const { name, removed, unique } of fields) {
    if (removed || !unique) {
      continue
    }

    indexes.push({ fields: [name], options: { unique: true } })
  }

  return indexes
}

export default CollectionForm
export type { FieldProps }
