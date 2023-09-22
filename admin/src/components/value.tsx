import CleanDate from './date'
import type { DefinitionType } from 'mangobase'
import IdTag from './id-tag'

function Value({ type, value }: { type: DefinitionType; value: any }) {
  if (value === undefined) {
    return null
  }

  switch (type) {
    case 'id':
      return <IdTag id={value} />

    case 'date':
      return <CleanDate date={value} />

    case 'object':
    case 'array':
      return <div>{JSON.stringify(value)}</div>

    case 'boolean':
      return (
        <span className="w-6 h-2 font-medium p-1 rounded bg-zinc-200 dark:bg-neutral-700">
          {JSON.stringify(value)}
        </span>
      )

    default:
      return <span>{value}</span>
  }
}

export default Value
