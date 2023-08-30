import {
  NavLink,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from 'react-router-dom'
import CleanDate from '../../../components/date'
import type Collection from '../../../client/collection'
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

  return (
    <div className="h-screen flex flex-col">
      <header className="mt-2">
        <h1 className="m-0 text-2xl font-bold">{collection.name}</h1>
        <div className="mt-2">
          {links.map((link) => (
            <NavLink
              className={({ isActive }: { isActive: boolean }) =>
                clsx(
                  'text-slate-500 dark:text-neutral-400 me-2 hover:underline',
                  {
                    'text-slate-800 dark:!text-neutral-200 underline': isActive,
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
      </header>

      <div className="mt-3 flex-1">
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
              className="transition-background hover:bg-slate-200 dark:hover:bg-neutral-700"
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
