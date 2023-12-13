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
      return (
        <div className="whitespace-nowrap">
          {ellipsize(JSON.stringify(value), 48)}
        </div>
      )

    case 'boolean':
      return (
        <span className="w-6 h-2 font-medium p-1 rounded bg-zinc-200 dark:bg-neutral-700">
          {JSON.stringify(value)}
        </span>
      )

    default: {
      if (typeof value === 'string') {
        return <span className="whitespace-nowrap">{ellipsize(value, 48)}</span>
      }

      return (
        <span className="whitespace-nowrap">
          {ellipsize(JSON.stringify(value), 48)}
        </span>
      )
    }
  }
}

function ellipsize(text: string | undefined, length: number) {
  if (!text) {
    return null
  }

  if (text.length <= length) {
    return text
  }

  return `${text.slice(0, length)}…`
}

export default Value
