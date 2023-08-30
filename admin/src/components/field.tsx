import { RegisterOptions, UseFormRegisterReturn } from 'react-hook-form'
import fieldTypes, { FieldType } from '../lib/field-types'
import Button from './button'
import Chip from './chip'
import Input from './input'
import Select from './select'
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
          <div className="flex gap-2">
            <label className="flex-1">
              <Input
                className="block w-full"
                disabled={removed}
                type="text"
                placeholder="Field name"
                {...register('name', { required: true })}
              />
            </label>
            <label>
              <Select
                disabled={existing}
                {...register('type', { required: true })}
              >
                {fieldTypes.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.title}
                  </option>
                ))}
              </Select>
            </label>

            <Button
              className="material-symbols-rounded !bg-slate-200 dark:!bg-neutral-600 text-gray-500 dark:!text-neutral-300"
              onClick={removed ? onRestore : onRemove}
              title={removed ? 'Restore' : 'Remove'}
              type="button"
            >
              {removed ? 'undo' : 'close'}
            </Button>
          </div>
        </div>
        <div className="mt-1 d-flex justify-content-between">
          <div>
            <label className="me-3">
              <input
                disabled={removed}
                type="checkbox"
                {...register('required')}
                className="me-1"
              />
              Required
            </label>

            {type !== 'boolean' && (
              <label>
                <input
                  disabled={removed}
                  type="checkbox"
                  {...register('unique')}
                  className="me-1"
                />
                Unique
              </label>
            )}
          </div>

          <div className="mt-3">
            {removed && (
              <Chip className="!bg-yellow-500 !text-white  !rounded-lg !py-0">
                Removed
              </Chip>
            )}
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
          <Select
            className="ms-2"
            disabled={disabled}
            {...register('relation', { required: true })}
          >
            {collections.value.map((collection) => (
              <option key={collection.name} value={collection.name}>
                {collection.name}
              </option>
            ))}
          </Select>
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

    case 'object':
      return <span className="material-symbols-rounded">data_object</span>

    case 'array':
      return <span className="material-symbols-rounded">data_array</span>

    case 'date':
      return <span className="material-symbols-rounded">calendar_today</span>

    default:
      return <span className="material-symbols-rounded">emergency</span>
  }
}

export default Field
