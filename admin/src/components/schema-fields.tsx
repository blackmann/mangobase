import { FieldValues, UseFormRegister } from 'react-hook-form'
import Input from './input'
import type { SchemaDefinitions } from 'mangobase'

interface Props {
  schema: SchemaDefinitions
  register: UseFormRegister<FieldValues>
}

function SchemaFields({ register, schema }: Props) {
  return (
    <div>
      {Object.entries(schema).map(([name, definition]) => {
        const labelText = <span className="col-span-1">{name}</span>

        return (
          <label className="grid grid-cols-3 gap-4 [&+&]:mt-2" key={name}>
            {labelText}
            {(() => {
              // iife
              switch (definition.type) {
                case 'string': {
                  return (
                    <Input
                      className="col-span-2"
                      defaultValue={definition.defaultValue}
                      type="string"
                      {...register(name, { required: definition.required })}
                    />
                  )
                }

                case 'number': {
                  return (
                    <Input
                      className="w-16 col-span-2"
                      defaultValue={definition.defaultValue}
                      type="number"
                      {...register(name, {
                        required: definition.required,
                        valueAsNumber: true,
                      })}
                    />
                  )
                }

                case 'boolean': {
                  return (
                    <Input
                      className="mt-2 col-span-2"
                      defaultChecked={definition.defaultValue}
                      type="checkbox"
                      {...register(name, { required: definition.required })}
                    />
                  )
                }

                default: {
                  return null
                }
              }
            })()}
          </label>
        )
      })}
    </div>
  )
}

export default SchemaFields
