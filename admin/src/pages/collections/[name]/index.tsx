import {
  Link,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from 'react-router-dom'
import type Collection from '../../../client/collection'
import React from 'preact/compat'

type RouteData = { collection: Collection }

function CollectionDetail() {
  const { collection } = useLoaderData() as RouteData

  return (
    <>
      <h1>{collection.name}</h1>

      <div>
        <Link to="">Records</Link> <Link to="hooks">Hooks</Link>{' '}
        <Link to="edit">Edit</Link>
      </div>

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
  }, [])

  React.useEffect(() => {
    loadNext()
  }, [loadNext])

  const fields = Object.keys(collection.schema)

  return (
    <table>
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
        {
          pages[pages.length-1]?.data.map((row: any) => (
            <tr key={row._id}>
              <td>{row._id}</td>
              {
                fields.map((field) => (
                  <td key={field}>{row[field]}</td>
                ))
              }
              <td>{row.created_at}</td>
              <td>{row.updated_at}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}

export default CollectionDetail
export { CollectionRecords }
