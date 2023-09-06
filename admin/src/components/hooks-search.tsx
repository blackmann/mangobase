import hooksRegistry, { loadHooksRegistry } from '../data/hooks-registry'
import Input from './input'
import React from 'preact/compat'
import clsx from 'clsx'

interface Props {
  onSelect?: (hookId: string) => void
}

function HooksSearch({ onSelect }: Props) {
  const [searchKey, setSearchKey] = React.useState('')
  const [focused, setFocused] = React.useState(false)

  function selectHook(id: string) {
    setSearchKey('')
    onSelect?.(id)
  }

  const results = React.useMemo(() => {
    const key = searchKey.trim().toLocaleLowerCase()
    if (!key) return hooksRegistry.value

    return hooksRegistry.value.filter(
      (hook) =>
        hook.name.toLowerCase().includes(key) ||
        hook.description.toLowerCase().includes(key)
    )
  }, [searchKey, hooksRegistry.value])

  const showResults = focused && Boolean(results.length)

  React.useEffect(() => {
    loadHooksRegistry()
  }, [])

  return (
    <div className="w-[23rem]">
      <Input
        className="bg-slate-100 w-full dark:bg-neutral-800"
        onChange={(e) => setSearchKey((e.target as HTMLInputElement).value)}
        placeholder="Search and add hook"
        type="search"
        value={searchKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {showResults && (
        <div className="bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600 rounded-md mt-2 max-h-[24rem] overflow-y-auto">
          <ul className="list-none p-0 m-0">
            {results.map((hook) => (
              <li
                className={clsx(
                  'resultsItem p-2 cursor-pointer transition-background duration-150 hover:bg-slate-200 dark:hover:bg-neutral-700 [&+&]:border-t [&+&]:border-t-slate-300 [&+&]:dark:border-t-neutral-600'
                )}
                key={hook.id}
                onMouseDown={() => selectHook(hook.id)}
              >
                <header className="font-medium">{hook.name}</header>
                <p className="text-slate-500 dark:text-neutral-400 m-0">
                  {hook.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default HooksSearch
