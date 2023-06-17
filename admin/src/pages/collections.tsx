import { NavLink } from 'react-router-dom'
import collections, { loadCollections } from '../lib/collections'
import React from 'preact/compat'

function CollectionsPage() {
  React.useEffect(() => {
    loadCollections()
  }, [])

  return (
    <div>
      <nav>
        <header>
          <div>Collections</div>

          <div>
            <input
              type="search"
              name="search"
              id="search"
              placeholder="Find collection"
            />

            <button>Add new collection</button>
          </div>
        </header>
        <ul>
          {collections.value.map((collection) => (
            <li key={collection.name}>
              <NavLink to={collection.name}>{collection.name}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default CollectionsPage
