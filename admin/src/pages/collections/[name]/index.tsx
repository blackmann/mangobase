import {
  NavLink,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from 'react-router-dom'
import Chip from '../../../components/chip'
import CleanDate from '../../../components/date'
import type Collection from '../../../client/collection'
import Copy from '../../../components/copy'
import IdTag from '../../../components/id-tag'
import Input from '../../../components/input'
import React from 'preact/compat'
import clsx from 'clsx'

type RouteData = { collection: Collection }

function CollectionDetail() {
  const { collection } = useLoaderData() as RouteData

  const links = [
    {
      href: '',
      title: 'Records',
    },
    {
      href: 'hooks',
      title: 'Hooks',
    },
    {
      href: `/logs/?label[$startswith]=/api/${collection.name}`,
      title: 'Logs',
    },
    {
      href: 'edit',
      title: 'Edit',
    },
  ]

  const path = `/api${collection.exposed ? '/' : '/_x/'}${collection.name}`
  const endpoint = `${window.location.protocol}//${window.location.host}${path}`

  return (
    <div className="h-screen flex flex-col">
      <header className="mt-2">
        <h1 className="m-0 text-xl font-bold">{collection.name}</h1>

        <div className="flex items-center">
          <Chip
            className="!px-1 !py-0 me-2"
            title="Only devs can access hidden collections"
          >
            {collection.exposed ? 'exposed' : 'hidden'}
          </Chip>

          <Chip className="!px-1 !py-0">
            <Copy className="text-sm" value={endpoint} />
            {path}
          </Chip>
        </div>

        <div className="mt-2 flex justify-between">
          <div>
            {links.map((link) => (
              <NavLink
                className={({ isActive }: { isActive: boolean }) =>
                  clsx(
                    'text-zinc-500 dark:text-neutral-400 me-2 hover:underline',
                    {
                      'text-zinc-800 dark:!text-neutral-200 underline':
                        isActive,
                    }
                  )
                }
                end
                key={link.href}
                to={link.href}
              >
                {link.title}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center">
            <span className="material-symbols-rounded text-base me-2 text-zinc-500 dark:text-neutral-400">
              code
            </span>

            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://degreat.co.uk/mangobase/guide/faqs.html#how-do-i-make-requests-to-my-api"
            >
              How to make requests?
            </a>
          </div>
        </div>
      </header>

      <div className="mt-3 flex-1 h-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}

function CollectionRecords() {
  const { collection } = useRouteLoaderData('collection') as RouteData
  const [pages, setPages] = React.useState<any[]>([])

  const loadNext = React.useCallback(async () => {
    const data = await collection.find()
    setPages((pages) => [...pages, data])
  }, [collection])

  React.useEffect(() => {
    loadNext()
  }, [loadNext])

  const fields = Object.keys(collection.schema)

  return (
    <>
      <Input
        className="w-full block mt-2"
        type="text"
        name="search"
        id="search"
        placeholder="Filter record. See docs for examples."
      />
      <table cellSpacing={0} className="w-full mt-3">
        <thead>
          <tr>
            <th>
              <input type="checkbox" />
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
          {pages[pages.length - 1]?.data.map((row: any) => (
            <tr
              className="transition-background hover:bg-zinc-200 dark:hover:bg-neutral-700"
              key={row._id}
            >
              <td style={{ width: '2rem' }}>
                <input type="checkbox" name="select" className="ms-1" />
              </td>
              <td>
                <IdTag id={row._id} />
              </td>
              {fields.map((field) => (
                <td key={field}>
                  {collection.schema[field].type === 'id' ? (
                    <IdTag id={row[field]} />
                  ) : (
                    row[field]
                  )}
                </td>
              ))}
              <td>
                <CleanDate date={row.created_at} />
              </td>
              <td>
                <CleanDate date={row.updated_at} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default CollectionDetail
export { CollectionRecords }
