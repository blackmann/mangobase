import { RegisterOptions, UseFormRegisterReturn } from 'react-hook-form'

interface Props {
  register: (name: string, o?: RegisterOptions) => UseFormRegisterReturn
}

function Field({ register }: Props) {
  return (
    <div>
      <label>
        name:
        <input type="text" {...register('name', { required: true })} />
      </label>

      <label>
        type:
        <select {...register('type', { required: true })}>
          <option value="string">string</option>
        </select>
      </label>
    </div>
  )
}

export default Field
