import {
  NavLink,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from 'react-router-dom'
import CleanDate from '../../../components/date'
import type Collection from '../../../client/collection'
import IdTag from '../../../components/id-tag'
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
    href: '/logs',
    title: 'Logs',
  },
  {
    href: 'edit',
    title: 'Edit',
  },
]

function CollectionDetail() {
  const { collection } = useLoaderData() as RouteData

  return (
    <div className={clsx('container-fluid', styles.main)}>
      <header className="mt-1">
        <h1 className="mb-0 mt-0">{collection.name}</h1>
        <div className={clsx(styles.tabs, 'mt-2')}>
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

      <div className={clsx('mt-3', styles.content)}>
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
      <input
        className="w-100 d-block mt-2"
        type="text"
        name="search"
        id="search"
        placeholder="Filter record. See docs for examples."
      />
      <table cellSpacing={0} className="w-100 mt-3">
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
            <tr className={styles.row} key={row._id}>
              <td style={{ width: '2rem' }}>
                <input type="checkbox" name="select" className="ms-1" />
              </td>
              <td>
                <IdTag id={row._id} />
              </td>
              {fields.map((field) => (
                <td key={field}>{row[field]}</td>
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
