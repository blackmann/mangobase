import { RegisterOptions, UseFormRegisterReturn } from 'react-hook-form'
import fieldTypes, { FieldType } from '../lib/field-types'
import Chip from './chip'
import Input from './input'
import collections from '../data/collections'

interface Props {
  onRestore?: VoidFunction
  onRemove?: VoidFunction
  watch: (name: string) => any
  register: (name: string, o?: RegisterOptions) => UseFormRegisterReturn
}

function Field({ onRemove, onRestore, watch, register }: Props) {
  const type = watch('type')
  const existing = watch('existing')
  const removed = watch('removed')

  return (
    <div className="flex py-4">
      <div className="text-slate-400 dark:text-neutral-500 me-2">
        <FieldIcon type={type} />
      </div>
      <div className="flex-1">
        <div>
          <div className="flex">
            <label className="flex-1 me-2">
              <Input
                className="d-block w-100"
                disabled={removed}
                type="text"
                placeholder="Field name"
                {...register('name', { required: true })}
              />
            </label>
            <label>
              <select
                disabled={existing}
                {...register('type', { required: true })}
              >
                {fieldTypes.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="mt-1 d-flex justify-content-between">
          <div>
            <label className="me-3">
              <input
                disabled={removed}
                type="checkbox"
                {...register('required')}
              />
              Required
            </label>

            {type !== 'boolean' && (
              <label>
                <input
                  disabled={removed}
                  type="checkbox"
                  {...register('unique')}
                />
                Unique
              </label>
            )}
          </div>

          <div>
            {removed && <Chip className="me-1 accent">Removed</Chip>}
            <button onClick={removed ? onRestore : onRemove} type="button">
              {removed ? 'Restore' : 'Remove'}
            </button>
          </div>
        </div>

        <FieldExtra disabled={removed} type={type} {...{ register, watch }} />
      </div>
    </div>
  )
}

interface FieldExtraProps extends Props {
  disabled: boolean
  type: FieldType
}

function FieldExtra({ disabled, type, register }: FieldExtraProps) {
  switch (type) {
    case 'id':
      return (
        <label>
          Relation
          <select
            className="ms-2"
            disabled={disabled}
            {...register('relation', { required: true })}
          >
            {collections.value.map((collection) => (
              <option key={collection.name} value={collection.name}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
      )
    // [ ] Object schema menu
    default: {
      return null
    }
  }
}

function FieldIcon({ type }: { type: string }) {
  switch (type) {
    case 'number':
      return <span className="material-symbols-rounded">123</span>

    case 'string':
      return <span className="material-symbols-rounded">title</span>

    default:
      return <span className="material-symbols-rounded">emergency</span>
  }
}

export default Field
