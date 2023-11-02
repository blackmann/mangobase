import CollectionDetail, { CollectionRecords } from './pages/collections/[name]'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import schemaRefs, { loadSchemaRefs } from './data/schema-refs'
import AdminLayout from './layouts/AdminLayout'
import AppError from './lib/app-error'
import Collection from './client/collection'
import CollectionEmptyState from './components/collections-empty-state'
import CollectionHooks from './pages/collections/[name]/hooks'
import CollectionsPage from './pages/collections'
import Devs from './pages/settings/devs'
import Edit from './pages/collections/[name]/edit'
import { LoaderErrorBoundary } from './components/general-error'
import Login from './pages/login'
import Logs from './pages/logs'
import NotFound from './pages/notfound'
import Profile from './pages/settings/profile'
import type { Ref } from 'mangobase'
import SchemaDetail from './pages/settings/schemas/[name]'
import Schemas from './pages/settings/schemas'
import Settings from './pages/settings'
import app from './mangobase-app'
import { loadCollections } from './data/collections'

interface CollectionRouteData {
  collection: Collection
}

async function getSchema(name: string): Promise<Ref> {
  if (!schemaRefs.value?.length) {
    await loadCollections()
    await loadSchemaRefs()
  }

  if (name === 'new') {
    return {
      name: 'Add new schema',
      schema: {},
    }
  }

  const nameParts = name.split('/')
  const refName = nameParts.pop()!
  const [scope] = nameParts

  try {
    const { data: schema } = await app.req.get(
      `_dev/schema-refs/${refName}?$scope=${scope || ''}`
    )

    return schema
  } catch (err) {
    throw new AppError((err as any).message, err)
  }
}

const routes = createBrowserRouter(
  [
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  element: <CollectionRecords />,
                  path: '',
                },
                {
                  element: <CollectionHooks />,
                  path: 'hooks',
                },
                {
                  element: <Edit />,
                  path: 'edit',
                },
              ],
              element: <CollectionDetail />,
              id: 'collection',
              loader: async ({ params }) => {
                console.log('reloaded')
                try {
                  const collection = await app.collection(params.name!)
                  return { collection }
                } catch (err) {
                  throw new AppError((err as any).message || '', err)
                }
              },
              path: ':name',
            },
            {
              element: <CollectionEmptyState />,
              path: '',
            },
          ],
          element: <CollectionsPage />,
          loader: async () => {
            try {
              await loadSchemaRefs()
              await loadCollections()
              return null
            } catch (err) {
              throw new AppError((err as any).message, err)
            }
          },
          path: 'collections',
        },
        {
          element: <Logs />,
          path: 'logs',
        },
        {
          children: [
            {
              element: <Schemas />,
              path: 'schemas',
            },
            {
              element: <SchemaDetail />,
              loader: async ({ params }) => {
                return await getSchema(params.name!)
              },
              path: 'schemas/:name',
            },
            {
              element: <SchemaDetail />,
              loader: async ({ params }) => {
                return await getSchema(`collections/${params.name}`)
              },
              path: 'schemas/collections/:name',
            },
            {
              element: <Profile />,
              path: 'profile',
            },
            {
              element: <Devs />,
              path: 'devs',
            },
            {
              element: <Navigate to="devs" replace />,
              path: '',
            },
          ],
          element: <Settings />,
          path: 'settings',
        },
        {
          element: <Navigate replace to="/collections" />,
          path: '',
        },
      ],
      element: <AdminLayout />,
      errorElement: <LoaderErrorBoundary />,
      path: '',
    },
    {
      element: <Login />,
      path: 'login',
    },
    {
      element: <NotFound />,
      path: '*',
    },
  ],
  {
    basename: '/_',
  }
)

export default routes
export type { CollectionRouteData }
