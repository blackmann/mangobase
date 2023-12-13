import { Navigate, createBrowserRouter } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import Collection from './client/collection'
import CollectionEmptyState from './components/collections-empty-state'
import Devs from './pages/settings/devs'
import { LoaderErrorBoundary } from './components/general-error'
import Login from './pages/login'
import NotFound from './pages/notfound'
import Profile from './pages/settings/profile'
import Schemas from './pages/settings/schemas'
import Settings from './pages/settings'

interface CollectionRouteData {
  collection: Collection
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
                  lazy: () => import('./pages/collections/[name]/edit'),
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
              lazy: () => import('./pages/settings/schemas/[name].tsx'),
              path: 'schemas/:name',
            },
            {
              lazy: () => import('./pages/settings/schemas/[name].tsx'),
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
