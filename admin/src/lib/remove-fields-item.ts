import {
  FieldValues,
  UseFieldArrayRemove,
  UseFormSetValue,
} from 'react-hook-form'
import { FieldProps } from '@/components/collection-form'

interface Options {
  index: number
  fields: FieldProps[]
  remove: UseFieldArrayRemove
  setValue: UseFormSetValue<FieldValues>
}

function removeFieldsItem({ index, fields, remove, setValue }: Options) {
  const field = fields[index]
  if (field.existing) {
    setValue(`fields.${index}.removed`, true)
    return
  }

  remove(index)
}

export default removeFieldsItem
