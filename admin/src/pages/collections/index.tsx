import { NavLink, Outlet } from 'react-router-dom'
import collections, { loadCollections } from '../../data/collections'
import CollectionForm from '../../components/collection-form'
import Input from '../../components/input'
import NavContentLayout from '../../layouts/NavContentLayout'
import React from 'preact/compat'
import clsx from 'clsx'

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
    <NavContentLayout
      nav={
        <>
          <header className="flex justify-between align-items-center mb-2">
            <div className="font-medium">Collections</div>
            <button
              className="text-slate-400 dark:text-neutral-300"
              onClick={() => showFormDialog()}
            >
              <span className="material-symbols-rounded">add</span>
            </button>
          </header>

          <Input
            className="w-full mb-2"
            type="search"
            name="search"
            id="search"
            required
            placeholder="Find collection"
          />

          <dialog
            ref={formDialog}
            className="rounded-md p-3 border border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800"
          >
            <h2 className="text-2xl font-bold mb-4">New collection</h2>
            {showingForm && (
              <CollectionForm key="new" onHide={() => hideFormDialog()} />
            )}
          </dialog>

          <ol className="list-none p-0">
            {collections.value.map((collection) => (
              <li key={collection.name}>
                <NavLink
                  className={({ isActive }: { isActive: boolean }) =>
                    clsx(
                      'text-slate-500 dark:text-neutral-400 d-flex no-underline px-0 hover:underline',
                      {
                        'text-slate-800 dark:!text-neutral-200 !underline':
                          isActive,
                      }
                    )
                  }
                  to={collection.name}
                >
                  {collection.exposed ? '/' : '-'}
                  {collection.name}
                </NavLink>
              </li>
            ))}
          </ol>
        </>
      }
    >
      <Outlet />
    </NavContentLayout>
  )
}

export default CollectionsPage
