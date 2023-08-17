import { RegisterOptions, UseFormRegisterReturn } from 'react-hook-form'
// import Chip from './chip'
import Asterix from '../icons/Asterix'
import Numbers from '../icons/Number'
import Text from '../icons/Text'
import clsx from 'clsx'
import styles from './field.module.css'

interface Props {
  onRemove?: VoidFunction
  watch: (name: string) => any
  register: (name: string, o?: RegisterOptions) => UseFormRegisterReturn
}

const fieldTypes = [
  { title: 'string', value: 'string' },
  { title: 'number', value: 'number' },
  { title: 'boolean', value: 'boolean' },
  { title: 'object id', value: 'id' },
  { title: 'date', value: 'date' },
  { title: 'array', value: 'array' },
  { title: 'object', value: 'object' },
  { title: 'any', value: 'any' },
] as const

function Field({ onRemove, watch, register }: Props) {
  const type = watch('type')

  return (
    <div className={clsx(styles.field)}>
      <div className="text-secondary me-2">
        {/** - [ ] Put leading icon representing type here */}
        <FieldIcon type={type} />
      </div>
      <div className="flex-1">
        <div>
          <div className="d-flex">
            <label className="flex-1 me-2">
              <input
                className="d-block w-100"
                type="text"
                placeholder="Field name"
                {...register('name', { required: true })}
              />
            </label>
            <label>
              <select {...register('type', { required: true })}>
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
              <input type="checkbox" {...register('required')} />
              Required
            </label>

            {type !== 'boolean' && (
              <label>
                <input type="checkbox" {...register('unique')} />
                Unique
              </label>
            )}
          </div>

          <div>
            {/* <Chip className="me-1 accent">Removed</Chip> */}
            <button onClick={onRemove}>Remove</button>
          </div>
        </div>

        <FieldExtra type={type} {...{ register, watch }} />
      </div>
    </div>
  )
}

interface FieldExtraProps extends Props {
  // get type
  type: string
}

function FieldExtra({ type }: FieldExtraProps) {
  switch (type) {
    // [ ] Relation select menu
    // [ ] Object schema menu
    default: {
      return null
    }
  }
}

function FieldIcon({ type }: { type: string }) {
  switch (type) {
    case 'number':
      return <Numbers />

    case 'string':
      return <Text />

    default:
      return <Asterix />
  }
}

export default Field
