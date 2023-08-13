import CollectionDetail, { CollectionRecords } from './pages/collections/[name]'
import AdminLayout from './layouts/AdminLayout'
import Collection from './client/collection'
import CollectionHooks from './pages/collections/[name]/hooks'
import CollectionsPage from './pages/collections'
import Login from './pages/login'
import Logs from './pages/logs'
import Wip from './pages/wip'
import app from './mangobase-app'
import { createBrowserRouter } from 'react-router-dom'
import Settings from './pages/settings'
import Profile from './pages/settings/profile'

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
                  element: <CollectionRecords />,
                  path: '',
                },
                {
                  element: <CollectionHooks />,
                  path: 'hooks',
                },
              ],
              element: <CollectionDetail />,
              id: 'collection',
              loader: async ({ params }) => {
                const collection = await app.collection(params.name!)
                return { collection }
              },
              path: ':name',
            },
          ],
          element: <CollectionsPage />,
          path: 'collections',
        },
        {
          element: <Logs />,
          path: 'logs',
        },
        {
          children: [
            {
              element: <Profile />,
              path: 'profile',
            },
          ],
          element: <Settings />,
          path: 'settings',
        },
        {
          element: <Wip />,
          path: '*',
        },
      ],
      element: <AdminLayout />,
      path: '',
    },
    {
      element: <Login />,
      path: 'login',
    },
    {
      element: <>Come back later, after!</>,
      path: '*',
    },
  ],
  {
    basename: '/_',
  }
)

export default routes
export type { CollectionRouteData }
