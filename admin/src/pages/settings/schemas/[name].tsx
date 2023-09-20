import { RegisterOptions, useFieldArray, useForm } from 'react-hook-form'
import Chip from '../../../components/chip'
import Field from '../../../components/field'
import React from 'preact/compat'
import { Ref } from 'mangobase'
import { useLoaderData } from 'react-router-dom'

function SchemaDetail() {
  const { control, register, reset, setValue, watch } = useForm()
  const { fields, append } = useFieldArray({ control, name: 'fields' })
  const ref = useLoaderData() as Ref

  React.useEffect(() => {
    reset()

    for (const [field, options] of Object.entries(ref.schema)) {
      const relation = options.type === 'id' ? options.relation : undefined

      append({
        existing: true,
        name: field,
        relation,
        required: options.required,
        type: options.type,
        unique: options.unique,
      })
    }
  }, [append, ref, reset, setValue])

  return (
    <div className="mt-2" key={ref.name}>
      <h1 className="font-bold text-base">{ref.name}</h1>
      <Chip className="!py-0">3 usages</Chip>

      <div className="grid grid-cols-5 mt-3 gap-5">
        <div className="col-span-2">
          <h2 className="font-bold text-md text-slate-500 dark:text-neutral-500">
            Schema
          </h2>

          <fieldset disabled={ref.name.startsWith('collection/')}>
            {fields.map((field, i) => (
              <Field
                key={field.id}
                register={(f: string, o?: RegisterOptions) =>
                  register(`fields.${i}.${f}`, o)
                }
                watch={(f) => watch(`fields.${i}.${f}`)}
              />
            ))}
          </fieldset>
        </div>

        <div className="col-span-1">
          <h2>Usages</h2>
        </div>
      </div>
    </div>
  )
}

export default SchemaDetail
