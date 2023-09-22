import {
  FieldValues,
  RegisterOptions,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { Ref, SchemaDefinitions } from 'mangobase'
import Button from '../../../components/button'
import Chip from '../../../components/chip'
import Field from '../../../components/field'
import { FieldProps } from '../../../components/collection-form'
import Input from '../../../components/input'
import React from 'preact/compat'
import app from '../../../mangobase-app'
import appendSchemaFields from '../../../lib/append-schema-fields'
import getNewFieldName from '../../../lib/get-new-field-name'
import { loadSchemaRefs } from '../../../data/schema-refs'
import removeFieldsItem from '../../../lib/remove-fields-item'

function SchemaDetail() {
  const { control, handleSubmit, register, reset, setValue, watch } = useForm()
  const { append, fields, remove } = useFieldArray({ control, name: 'fields' })
  const ref = useLoaderData() as Ref & { $usages: string[] }

  const { name } = useParams()
  const isNew = name === 'new'

  const navigate = useNavigate()

  function handleRemove(index: number) {
    removeFieldsItem({
      fields: fields as unknown as FieldProps[],
      index,
      remove,
      setValue,
    })
  }

  // [ ] schema name shouldn't start with 'collection/'. This is reserved
  // for schema related to template collections
  async function submit(data: FieldValues) {
    const schema: SchemaDefinitions = {}

    for (const { name, ...definition } of data.fields) {
      schema[name] = definition
    }

    const refData = {
      name: data.name,
      schema,
    }

    isNew
      ? await app.req.post('/_dev/schema-refs', refData)
      : await app.req.patch(`/_dev/schema-refs/${ref.name}`, refData)

    await loadSchemaRefs()
    // [ ] Add ?created=1 to help show a created notification
    navigate(`/settings/schemas/${refData.name}`)
  }

  const addNewField = React.useCallback(() => {
    append({
      name: getNewFieldName(fields as unknown as { name: string }[]),
      type: 'string',
    })
  }, [append, fields])

  // this is a wild hack:
  // React effects are called in order but with the previous state
  // So even if you updated a state in a previous effect, it won't be
  // available in the next effect.
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    reset()

    if (!isNew) {
      setValue('name', ref.name)
    }

    appendSchemaFields(append, ref.schema)
    setReady(true)
  }, [append, isNew, ref, reset, setValue])

  React.useEffect(() => {
    if (fields.length || !ready) {
      return
    }

    addNewField()
  }, [addNewField, fields, ref, ready])

  // we don't allow edits on template collections
  const fromCollection = ref.name.startsWith('collection/')

  const collectionEdit = fromCollection
    ? `${ref.name.replace('collection/', '/collections/')}/edit`
    : ''

  const usages = ref.$usages

  return (
    <div className="mt-3">
      <h1 className="font-bold text-base">{ref.name}</h1>
      <Chip className="!py-0">{usages.length} usages</Chip>

      <div className="grid grid-cols-3 mt-3 gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        <form className="col-span-2" onSubmit={handleSubmit(submit)}>
          <label className="mb-2 block">
            <div>Name</div>
            <Input
              className="block w-full"
              placeholder="eg. address"
              {...register('name', { required: true })}
            />
          </label>

          <h2 className="font-bold text-md text-zinc-500 dark:text-neutral-500">
            Schema
          </h2>

          {fromCollection && (
            <div className="p-2 rounded-md bg-zinc-200 dark:bg-neutral-600 flex">
              <div className="leading-none">
                <span className="material-symbols-rounded text-base text-blue-600 dark:text-blue-300 me-2">
                  info
                </span>
              </div>

              <p>
                This is a collection template. You cannot edit this schema from
                here. Go here instead:{' '}
                <Link
                  className="underline text-zinc-500 dark:text-neutral-300"
                  to={collectionEdit}
                >
                  {collectionEdit}
                </Link>
              </p>
            </div>
          )}

          <fieldset disabled={fromCollection}>
            {fields.map((field, i) => (
              <Field
                key={field.id}
                onRemove={() => handleRemove(i)}
                register={(f: string, o?: RegisterOptions) =>
                  register(`fields.${i}.${f}`, o)
                }
                watch={(f) => watch(`fields.${i}.${f}`)}
              />
            ))}
          </fieldset>

          <div className="mb-2">
            <Button
              disabled={fromCollection}
              onClick={addNewField}
              type="button"
            >
              Add new field
            </Button>
          </div>

          <Button disabled={fromCollection} variant="primary">
            {isNew ? 'Create' : 'Update'}
          </Button>
        </form>

        <div className="col-span-1">
          <h2 className="font-bold text-zinc-500 dark:text-neutral-500">
            Usages
          </h2>

          {!usages.length && <p>This schema has no usages</p>}

          <ul className="mt-2">
            {usages.map((usage) => (
              <li key={usage}>
                <Link
                  className="underline text-zinc-500 dark:text-neutral-300"
                  to={
                    usage.startsWith('collection/')
                      ? usage.replace('collection/', '/collections/')
                      : `/settings/schemas/${usage}`
                  }
                >
                  {usage}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SchemaDetail
