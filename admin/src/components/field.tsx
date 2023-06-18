import { UseFormRegisterReturn } from 'react-hook-form'

interface Props {
  register: (name: string) => UseFormRegisterReturn
}

function Field({ register }: Props) {
  return (
    <div>
      <label>
        Name
        <input type="text" {...register('name')} />
      </label>

      <label>
        Type
        <select {...register('type')}>
          <option value="string">string</option>
        </select>
      </label>
    </div>
  )
}

export default Field
