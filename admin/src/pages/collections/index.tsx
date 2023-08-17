import { NavLink, Outlet } from 'react-router-dom'
import collections, { loadCollections } from '../../data/collections'
import CollectionForm from '../../components/collection-form'
import Plus from '../../icons/Plus'
import React from 'preact/compat'
import clsx from 'clsx'
import styles from './index.module.css'

function CollectionsPage() {
  const formDialog = React.useRef<HTMLDialogElement>(null)
  const [showingForm, setShowingForm] = React.useState(false)

  function showFormDialog() {
    formDialog.current?.showModal()
    setShowingForm(true)
  }

  function hideFormDialog() {
    formDialog.current?.close()
    setShowingForm(false)
  }

  React.useEffect(() => {
    loadCollections()
  }, [])

  return (
    <div className="container-fluid">
      <div class="row">
        <nav class="col-md-2 mt-1">
          <header className="d-flex justify-content-between align-items-center">
            <div className="medium">Collections</div>

            <div>
              <button
                className="plain-button text-secondary"
                onClick={() => showFormDialog()}
              >
                <Plus />
              </button>
            </div>
          </header>

          <input
            className="w-100"
            type="search"
            name="search"
            id="search"
            placeholder="Find collection"
          />

          <dialog ref={formDialog} className="dialog">
            <h2 className="mt-0">Add new collection</h2>
            {showingForm && (
              <CollectionForm key="new" onHide={() => hideFormDialog()} />
            )}
          </dialog>

          <ol className={styles.collections}>
            {collections.value.map((collection) => (
              <li key={collection.name}>
                <NavLink
                  className={({ isActive }: { isActive: boolean }) =>
                    clsx('text-secondary d-flex', styles.collectionLink, {
                      [styles.active]: isActive,
                    })
                  }
                  to={collection.name}
                >
                  {collection.exposed ? '/' : '-'}
                  {collection.name}
                </NavLink>
              </li>
            ))}
          </ol>
        </nav>

        <div className="col-md-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default CollectionsPage
