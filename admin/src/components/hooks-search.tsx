import hooksRegistry, { loadHooksRegistry } from '../data/hooks-registry'
import React from 'preact/compat'
import styles from './hooks-search.module.css'

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
    <div className={styles.hooksSearch}>
      <input
        className={styles.input}
        onChange={(e) => setSearchKey((e.target as HTMLInputElement).value)}
        placeholder="Search and add hook"
        type="search"
        value={searchKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {showResults && (
        <div className={styles.results}>
          <ul>
            {results.map((hook) => (
              <li
                className={styles.resultsItem}
                key={hook.id}
                onMouseDown={() => selectHook(hook.id)}
              >
                <header>{hook.name}</header>
                <p className="text-secondary m-0">{hook.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default HooksSearch
