import {
  RegisterOptions,
  UseFormRegisterReturn,
  useFormContext,
} from 'react-hook-form'
import fieldTypes, { FieldType } from '@/lib/field-types'
import schemaRefs, { loadSchemaRefs } from '@/data/schema-refs'
import Button from './button'
import Chip from './chip'
import { ControlledChipsInput } from './chips-input'
import Input from './input'
import Select from './select'
import collections from '@/data/collections'

interface Props {
  name: string
  onRestore?: VoidFunction
  onRemove?: VoidFunction
}

function Field({ name, onRemove, onRestore }: Props) {
  const { register, watch } = useFormContext()

  function _(key: string) {
    return `${name}.${key}`
  }

  const type = watch(_('type'))
  const existing = watch(_('existing'))
  const removed = watch(_('removed'))

  return (
    <div className="flex py-4">
      <div className="text-zinc-400 dark:text-neutral-500 me-2">
        <span className="material-symbols-rounded">
          {DATA_TYPE_ICONS[type]}
        </span>
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
                {...register(_('name'), { required: true })}
              />
            </label>
            <label>
              <Select
                disabled={existing}
                {...register(_('type'), { required: true })}
              >
                {fieldTypes.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.title}
                  </option>
                ))}
              </Select>
            </label>

            <Button
              className="material-symbols-rounded !bg-zinc-200 dark:!bg-neutral-700 hover:!bg-zinc-300 dark:hover:!bg-neutral-600 text-sm"
              onClick={removed ? onRestore : onRemove}
              title={removed ? 'Restore' : 'Remove'}
              type="button"
            >
              {removed ? 'undo' : 'close'}
            </Button>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-3 justify-between">
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <Input
                disabled={removed}
                type="checkbox"
                {...register(_('required'))}
                className="me-1"
              />
              Required
            </label>

            {!['boolean', 'object', 'array'].includes(type) && (
              <label className="inline-flex items-center">
                <Input
                  disabled={removed}
                  type="checkbox"
                  {...register('unique')}
                  className="me-1"
                />
                Unique
              </label>
            )}
          </div>

          <div>
            {removed && (
              <Chip className="!bg-orange-500 !text-white !rounded-lg !py-0 text-sm">
                Removed
              </Chip>
            )}
          </div>
        </div>

        <fieldset disabled={removed}>
          <FieldExtra name={name} type={type} />
        </fieldset>
      </div>
    </div>
  )
}

interface FieldExtraProps extends Props {
  type: FieldType
}

function FieldExtra({ type, name }: FieldExtraProps) {
  const { control, register, watch } = useFormContext()

  function _(key: string) {
    return `${name}.${key}`
  }

  switch (type) {
    case 'id':
      return (
        <label>
          Relation
          <Select
            className="ms-2"
            {...register(_('relation'), { required: true })}
          >
            {collections.value.map((collection) => (
              <option key={collection.name} value={collection.name}>
                {collection.name}
              </option>
            ))}
          </Select>
        </label>
      )

    case 'object': {
      return <SchemaSelect name={_('schema')} register={register} />
    }

    case 'array': {
      const type = watch(_('items.type'))

      return (
        <div className="flex">
          <label className="me-2">
            Item
            <Select
              className="ms-2"
              {...register(_('items.type'), { required: true })}
            >
              {fieldTypes.map((field) => {
                if (field.value === 'array') {
                  // [ ] Should we provide UX for nested arrays? For now no
                  return null
                }

                return (
                  <option key={field.value} value={field.value}>
                    {field.title}
                  </option>
                )
              })}
            </Select>
          </label>

          {type === 'object' && (
            <SchemaSelect name={_('items.schema')} register={register} />
          )}

          {type === 'id' && (
            <label className="ms-2">
              Relation
              <Select
                className="ms-2"
                {...register(_('items.relation'), { required: true })}
              >
                {collections.value.map((collection) => (
                  <option key={collection.name} value={collection.name}>
                    {collection.name}
                  </option>
                ))}
              </Select>
            </label>
          )}
        </div>
      )
    }

    case 'string': {
      return (
        <div className="mt-2">
          <ControlledChipsInput
            placeholder="Enum (optional)"
            control={control}
            name={_('enum')}
          />
        </div>
      )
    }

    default: {
      return null
    }
  }
}

interface SchemaSelectProps {
  name: string
  register: (name: string, o?: RegisterOptions) => UseFormRegisterReturn
}

function SchemaSelect({ name, register }: SchemaSelectProps) {
  return (
    <div>
      <label className="flex items-center">
        Schema
        <Select className="ms-2" {...register(name, { required: true })}>
          {schemaRefs.value.map((schema) => (
            <option key={schema.name} value={schema.name}>
              {schema.name}
            </option>
          ))}
        </Select>
        <Button
          className="!bg-transparent !p-0 leading-none ms-2 material-symbols-rounded text-base"
          title="Refresh schema list"
          type="button"
          onClick={() => loadSchemaRefs()}
        >
          refresh
        </Button>
      </label>
      <a
        className="underline text-secondary"
        href="/_/settings/schemas"
        target="_blank"
      >
        Add/edit schema from here
      </a>
    </div>
  )
}

const DATA_TYPE_ICONS: Record<string, string> = {
  any: 'emergency',
  array: 'data_array',
  boolean: 'check_box',
  date: 'calendar_today',
  file: 'file_copy',
  id: 'link',
  number: '123',
  object: 'data_object',
  string: 'title',
}

export default Field
