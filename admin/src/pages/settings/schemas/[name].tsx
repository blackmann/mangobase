import { RegisterOptions, useFieldArray, useForm } from 'react-hook-form'
import Button from '../../../components/button'
import Chip from '../../../components/chip'
import Field from '../../../components/field'
import { FieldProps } from '../../../components/collection-form'
import React from 'preact/compat'
import { Ref } from 'mangobase'
import appendSchemaFields from '../../../lib/append-schema-fields'
import getNewFieldName from '../../../lib/get-new-field-name'
import removeFieldsItem from '../../../lib/remove-fields-item'
import { useLoaderData } from 'react-router-dom'

function SchemaDetail() {
  const { control, handleSubmit, register, reset, setValue, watch } = useForm()
  const { append, fields, remove } = useFieldArray({ control, name: 'fields' })
  const ref = useLoaderData() as Ref

  function handleRemove(index: number) {
    removeFieldsItem({
      fields: fields as unknown as FieldProps[],
      index,
      remove,
      setValue,
    })
  }

  function submit() {
    //
  }

  const addNewField = React.useCallback(() => {
    append({
      name: getNewFieldName(fields as unknown as { name: string }[]),
      type: 'string',
    })
  }, [append, fields])

  React.useEffect(() => {
    reset()

    appendSchemaFields(append, ref.schema)
  }, [append, ref, reset, setValue])

  React.useEffect(() => {
    if (fields.length === 0) {
      addNewField()
    }
  }, [addNewField, fields])

  // we don't allow edits on template collections
  const fromCollection = ref.name.startsWith('collection/')

  return (
    <div className="mt-3">
      <h1 className="font-bold text-base">{ref.name}</h1>
      <Chip className="!py-0">3 usages</Chip>

      <div className="grid grid-cols-3 mt-3 gap-5 lg:grid-cols-5">
        <form className="col-span-2" onSubmit={handleSubmit(submit)}>
          <h2 className="font-bold text-md text-slate-500 dark:text-neutral-500">
            Schema
          </h2>

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
            <Button onClick={addNewField} type="button">
              Add new field
            </Button>
          </div>

          <Button variant="primary">Update</Button>
        </form>

        <div className="col-span-1">
          <h2>Usages</h2>
        </div>
      </div>
    </div>
  )
}

export default SchemaDetail
