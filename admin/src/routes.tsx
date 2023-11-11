import { Navigate, createBrowserRouter } from 'react-router-dom'
import schemaRefs, { loadSchemaRefs } from './data/schema-refs'
import AdminLayout from './layouts/AdminLayout'
import AppError from './lib/app-error'
import Collection from './client/collection'
import CollectionEmptyState from './components/collections-empty-state'
import Devs from './pages/settings/devs'
import { LoaderErrorBoundary } from './components/general-error'
import Login from './pages/login'
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
                  lazy: () => import('./pages/collections/[name]/index.tsx'),
                  path: '',
                },
                {
                  lazy: () => import('./pages/collections/[name]/hooks'),
                  path: 'hooks',
                },
                {
                  element: () => import('./pages/collections/[name]/edit'),
                  path: 'edit',
                },
              ],
              id: 'collection',
              lazy: () => import('./pages/collections/[name]/_layout.tsx'),
              path: ':name',
            },
            {
              element: <CollectionEmptyState />,
              path: '',
            },
          ],
          lazy: () => import('./pages/collections'),
          path: 'collections',
        },
        {
          lazy: () => import('./pages/logs'),
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
