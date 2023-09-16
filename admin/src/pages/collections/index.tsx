import CollectionForm from '../../components/collection-form'
import Input from '../../components/input'
import NavContentLayout from '../../layouts/NavContentLayout'
import NavLinks from '../../components/nav-links'
import { Outlet } from 'react-router-dom'
import React from 'preact/compat'
import collections from '../../data/collections'

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

  return (
    <NavContentLayout
      nav={
        <>
          <header className="flex justify-between items-center mb-2">
            <div className="text-base font-bold">Collections</div>
            <button
              className="text-slate-400 dark:text-neutral-300 leading-none"
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

          <NavLinks
            links={collections.value.map((collection) => ({
              path: collection.name,
              title: `${collection.exposed ? '' : '-'}${collection.name}`,
            }))}
          />
        </>
      }
    >
      <Outlet />
    </NavContentLayout>
  )
}

export default CollectionsPage
