import { NavLink } from 'react-router-dom'
import collections, { loadCollections } from '../lib/collections'
import React from 'preact/compat'
import CollectionForm from '../components/collection-form'

function CollectionsPage() {
  const [showCollectionForm, setShowCollectionForm] = React.useState(false)

  React.useEffect(() => {
    loadCollections()
  }, [])

  console.log(showCollectionForm)

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

            <button onClick={() => setShowCollectionForm(true)}>
              Add new collection
            </button>
          </div>
        </header>

        <dialog open={showCollectionForm}>
          <CollectionForm onHide={() => setShowCollectionForm(false)}/>
        </dialog>

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
