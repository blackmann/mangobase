import Button from '../../../components/button'
import CleanDate from '../../../components/date'
import type Collection from '../../../client/collection'
import IdTag from '../../../components/id-tag'
import Input from '../../../components/input'
import React from 'preact/compat'
import Value from '../../../components/value'
import { useForm } from 'react-hook-form'
import { useRouteLoaderData } from 'react-router-dom'

export type RouteData = { collection: Collection }

function Component() {
  const { collection } = useRouteLoaderData('collection') as RouteData
  const [pages, setPages] = React.useState<any[]>([])

  const { register, watch, setValue } = useForm()

  const $selected = watch('select')

  // [ ]: Properly implement this
  const loadNext = React.useCallback(async () => {
    const data = await collection.find()
    setPages((pages) => [...pages, data])
  }, [collection])

  async function handleOnDelete() {
    await Promise.allSettled(
      $selected.map((id: string) => collection.delete(id))
    )

    setValue('select', [])

    await loadNext()
  }

  function handleAllToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const allSelected = pages[pages.length - 1]?.data.map((row: any) => row._id)
    const target = e.target! as HTMLInputElement
    if (target.checked) {
      setValue('select', allSelected?.length ? allSelected : undefined)
      return
    }

    setValue('select', undefined)
  }

  React.useEffect(() => {
    loadNext()
  }, [loadNext])

  React.useEffect(() => {
    setValue('select', undefined)
  }, [collection])

  const fields = Object.keys(collection.schema)

  const currentPageItems = pages[pages.length - 1]?.data
  const selectionCount = typeof $selected === 'string' ? 1 : $selected?.length
  const indeterminate =
    selectionCount > 0 &&
    currentPageItems?.length > 0 &&
    selectionCount < currentPageItems.length

  return (
    <div className="h-0 flex-1 flex flex-col gap-2">
      <Input
        className="w-full block mt-2"
        type="text"
        name="search"
        id="search"
        placeholder="Filter record. See docs for examples."
      />

      <div className="h-0 flex-1 overflow-y-auto pe-[1px]">
        <table cellSpacing={0} className="w-full">
          <thead className="sticky top-0 bg-zinc-100">
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="ms-1"
                  indeterminate={indeterminate}
                  onChange={handleAllToggle}
                />
              </th>

              <th>id</th>

              {fields.map((field) => (
                <th key={field}>{field}</th>
              ))}

              <th>created_at</th>

              <th>updated_at</th>
            </tr>
          </thead>

          <tbody>
            {currentPageItems?.map((row: any) => (
              <tr
                className="transition-background duration-200 hover:bg-zinc-200 hover:bg-opacity-50 dark:hover:bg-neutral-700 dark:hover:bg-opacity-50"
                key={row._id}
              >
                <td className="w-[2rem] rounded-s-lg">
                  <input
                    type="checkbox"
                    value={row._id}
                    className="ms-1"
                    {...register('select')}
                  />
                </td>
                <td>
                  <IdTag id={row._id} />
                </td>
                {fields.map((field) => (
                  <td key={field}>
                    <Value
                      type={collection.schema[field].type}
                      value={row[field]}
                    />
                  </td>
                ))}
                <td>
                  <CleanDate date={row.created_at} />
                </td>
                <td className="rounded-e-lg">
                  <CleanDate date={row.updated_at} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectionCount > 0 && (
        <SelectionContextActions
          count={selectionCount}
          onDelete={handleOnDelete}
        />
      )}
    </div>
  )
}

interface ActionsProps {
  count: number
  onDelete: () => Promise<void>
}

function SelectionContextActions({ count, onDelete }: ActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onDelete()
  }

  if (showDeleteConfirm) {
    return (
      <div className="absolute bottom-8 left-[50%] translate-x-[-50%] border border-red-500 bg-red-500 rounded-xl px-2 py-1 text-white flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="material-symbols-rounded text-lg items-center inline-flex">
            warning
          </span>{' '}
          Are you sure you want to delete {count} items?
        </span>

        <div className="flex items-center gap-2">
          <Button
            className="!bg-red-700 text-white !py-0"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>

          {!deleting && (
            <Button
              className="!bg-white !text-red-500 !py-0"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="absolute bottom-8 left-[50%] translate-x-[-50%] border border-zinc-300 dark:border-neutral-500 bg-zinc-200 dark:bg-neutral-700 rounded-xl px-2 py-1 text-zinc-600 dark:text-neutral-200 flex items-center gap-4">
      <span className="flex items-center gap-2">
        <span className="material-symbols-rounded text-lg">check</span> {count}{' '}
        items selected
      </span>
      <Button
        className="!bg-red-500 text-white !py-0"
        onClick={() => setShowDeleteConfirm(true)}
      >
        Delete
      </Button>
    </div>
  )
}

export { Component }
