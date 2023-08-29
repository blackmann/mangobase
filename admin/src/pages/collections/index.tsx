import { NavLink, Outlet } from 'react-router-dom'
import collections, { loadCollections } from '../../data/collections'
import CollectionForm from '../../components/collection-form'
import Input from '../../components/input'
import Plus from '../../icons/Plus'
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
    <div class="grid grid-cols-12 xl:grid-cols-10 gap-4 me-4">
      <nav class="col-span-2 xl:col-span-2 2xl:col-span-1 mt-1">
        <header className="flex justify-between align-items-center mb-2">
          <div className="font-medium">Collections</div>
          <button className="text-gray-400" onClick={() => showFormDialog()}>
            <Plus />
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
          <h2 className="text-2xl font-bold">Add new collection</h2>
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
                    'text-gray-500 dark:text-gray-400 d-flex no-underline px-0 hover:underline',
                    {
                      'text-gray-800 dark:!text-gray-200 !underline': isActive,
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
      </nav>

      <div className="col-span-10 xl:col-span-8 2xl:col-span-9">
        <Outlet />
      </div>
    </div>
  )
}

export default CollectionsPage
