import hooksRegistry, { loadHooksRegistry } from '../data/hooks-registry'
import React from 'preact/compat'
import styles from './hooks-search.module.css'

function HooksSearch() {
  const [searchKey, setSearchKey] = React.useState('')

  const results = React.useMemo(() => {
    const key = searchKey.trim().toLocaleLowerCase()
    if (!key) return []

    return hooksRegistry.value.filter(
      (hook) =>
        hook.name.toLowerCase().includes(key) ||
        hook.description.toLowerCase().includes(key)
    )
  }, [searchKey])

  const showResults = Boolean(results.length)

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
      />

      {showResults && (
        <div className={styles.results}>
          <ul>
            {results.map((hook) => (
              <li className={styles.resultsItem} key={hook.id}>
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
