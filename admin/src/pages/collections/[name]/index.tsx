import {
  NavLink,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from 'react-router-dom'
import type Collection from '../../../client/collection'
import React from 'preact/compat'
import clsx from 'clsx'
import styles from './index.module.css'

type RouteData = { collection: Collection }

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
    href: 'edit',
    title: 'Edit',
  },
  {
    href: '/logs',
    title: 'Logs',
  },
]

function CollectionDetail() {
  const { collection } = useLoaderData() as RouteData

  return (
    <>
      <header className="d-flex justify-content-between align-items-center mt-1">
        <h1 className="mb-0 mt-0">{collection.name}</h1>

        <div className={styles.tabs}>
          {links.map((link) => (
            <NavLink
              className={({ isActive }: { isActive: boolean }) =>
                clsx('text-secondary', { [styles.active]: isActive })
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

      <Outlet />
    </>
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
    <table className="w-100">
      <thead>
        <tr>
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
          <tr key={row._id}>
            <td>{row._id}</td>
            {fields.map((field) => (
              <td key={field}>{row[field]}</td>
            ))}
            <td>{row.created_at}</td>
            <td>{row.updated_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default CollectionDetail
export { CollectionRecords }
