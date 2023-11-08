import { ControlledChipsInput, Value } from './chips-input'
import type { Definition, Index, MigrationStep, SortOrder } from 'mangobase'
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
import Select from './select'
import app from '../mangobase-app'
import { appendIndexFields } from '../lib/append-index-fields'
import appendSchemaFields from '../lib/append-schema-fields'
import getNewFieldName from '../lib/get-new-field-name'
import { loadCollections } from '../data/collections'

type ValidatedIndex = Index & { existing?: boolean }

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

  // some additional props for specific field types
  [key: string]: any
}

const SLUG_REGEX = /^[A-Za-z0-9_]+(?:-[A-Za-z0-9]+)*$/

function CollectionForm({ collection, onHide }: Props) {
  const {
    control,
    formState,
    getFieldState,
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    setError,
    watch,
  } = useForm()

  const {
    fields,
    append,
    remove: removeFields,
  } = useFieldArray({
    control,
    name: 'fields',
  })

  const {
    fields: indexes,
    append: appendIndex,
    remove: removeIndexes,
    update: updateIndexes,
  } = useFieldArray({
    control,
    name: 'indexes',
  })

  const [submitting, setSubmitting] = React.useState(false)

  function handleRemove(index: number) {
    const field = fields[index] as unknown as FieldProps
    if (field.existing) {
      setValue(`fields.${index}.removed`, true)
      return
    }

    removeFields(index)
  }

  function handleRestore(index: number) {
    setValue(`fields.${index}.removed`, false)
  }

  function handleUpdateIndexFieldSort(index: number, subfieldIndex: number) {
    const indexConfig = getValues(`indexes.${index}`)
    updateIndexes(index, {
      ...indexConfig,
      fields: indexConfig.fields.map((f: Value, i: number) =>
        i !== subfieldIndex ? f : { ...f, sort: f.sort === -1 ? 1 : -1 }
      ),
    })
  }

  function addIndexEntry() {
    appendIndex({
      fields: [],
    })
  }

  function validateIndexes() {
    const fieldsNamesEntries = getValues('fields').map(
      ({ name }: FieldProps) => [name, true]
    )

    const indexes = getValues('indexes') as {
      fields: (Value & { sort?: SortOrder })[]
      constraint: string
      existing?: boolean
    }[]

    const fieldsNames = Object.fromEntries(fieldsNamesEntries)

    const validatedIndexes: ValidatedIndex[] = []

    for (const [i, { fields, constraint, existing }] of indexes.entries()) {
      const validFields: [string, SortOrder][] = []
      for (const { text, sort } of fields) {
        if (!fieldsNames[text]) {
          // [ ]: render error
          setError(
            `indexes.${i}.fields`,
            {
              message: `Index field "${text}" does not exist on this collection`,
              type: 'custom',
            },
            {
              shouldFocus: true,
            }
          )

          return undefined
        }

        validFields.push([text, sort || 1])
      }

      const options: Record<string, any> = {}
      if (constraint && constraint !== 'none') {
        options[constraint] = true
      }

      validatedIndexes.push({ existing, fields: validFields, options })
    }

    return validatedIndexes
  }

  async function submitForm(form: FieldValues) {
    const indexes = validateIndexes()

    if (!indexes || submitting || collection?.readOnlySchema) {
      return
    }

    try {
      setSubmitting(true)
      await save(form, indexes)
    } catch (err) {
      setSubmitting(false)
    }
  }

  async function save(form: FieldValues, indexes: Index[]) {
    const { name, options, fields } = form

    const migrationSteps = prepareMigrations(collection, name, {
      fields,
      indexes,
    })

    const data = {
      exposed: options.includes('expose'),
      indexes,
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
    removeFields()
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
    removeFields()
    appendSchemaFields(append, collection.schema)

    removeIndexes()
    appendIndexFields(appendIndex, collection.indexes || [])
  }, [append, appendIndex, collection, removeFields, removeIndexes, setValue])

  React.useEffect(() => {
    if (collection || fields.length) {
      return
    }

    addNewField()
  }, [addNewField, collection, fields])

  const submitLabel = collection ? 'Update' : 'Create'

  console.log('indexes-form', indexes)

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

      <div className="text-secondary text-sm">
        This becomes endpoint name.{' '}
        {getFieldState('name', formState).error && (
          <span className="text-red-500 dark:text-orange-400 mt-1">
            Name must be a valid slug.
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div className="col-span-1">
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

          <p className="text-secondary ms-7 text-sm">
            Check this if this collection should have a public endpoint. See{' '}
            <Link to="/docs" className="underline">
              docs
            </Link>
            .
          </p>
        </div>

        <div className="col-span-1">
          <label>
            <Input
              type="checkbox"
              value="is-template"
              {...register('options')}
              className="me-2"
            />
            Use as template
          </label>

          <p className="text-secondary mt-0 ms-7 text-sm">
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

        <p className="my-4">
          <code className="py-0">created_at</code> and{' '}
          <code className="py-0">updated_at</code> fields are automatically set
        </p>
      </fieldset>

      <fieldset className="my-4">
        <legend className="font-medium w-full mb-2">Indexes (Optional)</legend>

        {indexes.map((indexConfig, index) => (
          <div className="flex gap-2 [&+&]:mt-2" key={indexConfig.id}>
            <div className="flex-1">
              <ControlledChipsInput
                control={control}
                name={`indexes.${index}.fields`}
                placeholder="Enter field names"
                getAction={(it: Value, subfieldIndex) => (
                  <button
                    className="material-symbols-rounded text-lg text-secondary"
                    title="sort: asc"
                    type="button"
                    onClick={() =>
                      handleUpdateIndexFieldSort(index, subfieldIndex)
                    }
                  >
                    {it.sort === -1 ? 'expand_less' : 'expand_more'}
                  </button>
                )}
              />
            </div>

            <div>
              <Select
                defaultValue="none"
                {...register(`indexes.${index}.constraint`)}
              >
                <option disabled selected>
                  Constraint
                </option>

                <option value="none">None</option>
                <option value="unique">Unique</option>
                <option value="sparse">Sparse</option>
              </Select>
            </div>
            <Button
              className="material-symbols-rounded !bg-zinc-200 dark:!bg-neutral-700 hover:!bg-zinc-300 dark:hover:!bg-neutral-600 text-sm h-[2.15rem]"
              onClick={() => removeIndexes(index)}
              title={'Remove'}
              type="button"
            >
              close
            </Button>
          </div>
        ))}

        {indexes.length === 0 && (
          <p className="text-secondary">No indexes added.</p>
        )}

        <Button className="mt-3" onClick={addIndexEntry} type="button">
          Add index
        </Button>
      </fieldset>

      <footer>
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

interface Options {
  fields: Record<string, any>[]
  indexes: ValidatedIndex[]
}

function prepareMigrations(
  collection: Collection | undefined,
  collectionName: string,
  { fields, indexes }: Options
) {
  const migrationSteps: MigrationStep[] = []

  if (!collection) {
    return migrationSteps
  }

  if (collectionName !== collection.name) {
    migrationSteps.push({
      collection: collection.name,
      to: collectionName,
      type: 'rename-collection',
    })
  }

  const oldFields = Object.entries(collection.schema)
  let i = 0
  // this is fine because we're not actually removing fields in the form
  // so the first n fields will always be the same between `oldFields` and `fields`
  for (; i < oldFields.length; i++) {
    const field = (fields as FieldProps[])[i]

    const [oldName, oldDefinition] = oldFields[i]
    if (field.removed) {
      migrationSteps.push({
        collection: collectionName,
        field: oldName,
        type: 'remove-field',
      })
      continue
    }

    if (oldName !== field.name) {
      migrationSteps.push({
        collection: collectionName,
        from: oldName,
        to: field.name,
        type: 'rename-field',
      })
    }

    if (Boolean(oldDefinition.unique) !== Boolean(field.unique)) {
      migrationSteps.push({
        collection: collectionName,
        constraints: {
          unique: field.unique,
        },
        field: field.name,
        type: 'update-constraints',
      })
    }
  }

  for (; i < fields.length; i++) {
    const field = (fields as FieldProps[])[i]
    const [name, definition] = definitionFromField(field)
    migrationSteps.push({
      collection: collectionName,
      definition: definition as Definition,
      name,
      type: 'add-field',
    })
  }

  for (const index of indexes) {
    if (index.existing) {
      // [ ]: we may need to disable editing index fields and just maintain options
      continue
    }

    migrationSteps.push({
      collection: collectionName,
      index,
      type: 'add-index',
    })
  }

  return migrationSteps
}

function schemaFromForm(fields: FieldProps[]) {
  const schema: Record<string, any> = {}
  for (const field of fields) {
    if (field.removed) {
      continue
    }

    const [name, definition] = definitionFromField(field)

    schema[name] = definition
  }

  return schema
}

function definitionFromField(field: FieldProps) {
  const { name, existing, removed, ...definition } = field
  return [name, definition] as const
}

export default CollectionForm
export type { FieldProps }
