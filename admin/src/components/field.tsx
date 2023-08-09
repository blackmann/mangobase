import { RegisterOptions, UseFormRegisterReturn } from 'react-hook-form'

interface Props {
  register: (name: string, o?: RegisterOptions) => UseFormRegisterReturn
}

const fieldTypes = [
  { title: 'string', value: 'string' },
  { title: 'number', value: 'number' },
  { title: 'object id', value: 'object_id' },
]

function Field({ register }: Props) {
  return (
    <div className="py-1 d-flex">
      {/** - [ ] Put leading icon representing type here */}
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
            <option key={field.value} value="string">
              {field.title}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default Field
