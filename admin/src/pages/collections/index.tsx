import { Outlet, useNavigate } from 'react-router-dom'
import Collection from '../../client/collection'
import CollectionForm from '../../components/collection-form'
import Input from '../../components/input'
import NavContentLayout from '../../layouts/NavContentLayout'
import NavLinks from '../../components/nav-links'
import React from 'preact/compat'
import collections from '../../data/collections'

function CollectionsPage() {
  const navigate = useNavigate()

  const formDialog = React.useRef<HTMLDialogElement>(null)
  const [showingForm, setShowingForm] = React.useState(false)

  const collectionLinks = React.useMemo(
    () =>
      [...collections.value]
        .sort((a, b) => {
          if (a.exposed && !b.exposed) {
            return -1
          }

          return a.name.localeCompare(b.name)
        })
        .map((collection) => ({
          path: collection.name,
          title: `${collection.exposed ? '' : '-'}${collection.name}`,
        })),
    [collections.value]
  )

  function showFormDialog() {
    formDialog.current?.showModal()
    setShowingForm(true)
  }

  function handleOnFormHide(collection?: Collection) {
    formDialog.current?.close()
    setShowingForm(false)

    if (collection) {
      navigate(`/collections/${collection.name}`)
    }
  }

  return (
    <NavContentLayout
      nav={
        <>
          <header className="flex justify-between items-center mb-2">
            <div className="text-base font-bold">Collections</div>
            <button
              className="text-zinc-400 dark:text-neutral-300 leading-none"
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
            className="rounded-md p-3 border border-zinc-300 dark:border-neutral-700 bg-zinc-100 dark:bg-neutral-800"
          >
            <h2 className="text-2xl font-bold mb-4">New collection</h2>
            {showingForm && (
              <CollectionForm key="new" onHide={handleOnFormHide} />
            )}
          </dialog>

          <NavLinks links={collectionLinks} />
        </>
      }
    >
      <Outlet />
    </NavContentLayout>
  )
}

export default CollectionsPage
