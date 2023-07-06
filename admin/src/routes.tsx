import CollectionDetail, { CollectionRecords } from './pages/collections/[name]'
import AdminLayout from './layouts/AdminLayout'
import CollectionHooks from './pages/collections/[name]/hooks'
import CollectionsPage from './pages/collections'
import Wip from './pages/wip'
import app from './mangobase-app'
import { createBrowserRouter } from 'react-router-dom'

const routes = createBrowserRouter(
  [
    {
      element: <AdminLayout />,
      path: '',
      children: [
        {
          path: 'collections',
          element: <CollectionsPage />,
          children: [
            {
              id: 'collection',
              path: ':name',
              loader: async ({ params }) => {
                const collection = await app.collection(params.name!)
                return { collection }
              },
              element: <CollectionDetail />,
              children: [
                {
                  path: '',
                  element: <CollectionRecords />,
                },
                {
                  path: 'hooks',
                  element: <CollectionHooks />,
                },
              ],
            },
          ],
        },
        {
          path: '*',
          element: <Wip />
        }
      ],
    },
    {
      path: '*',
      element: <>Come back later, after!</>,
    },
  ],
  {
    basename: '/_',
  }
)

export default routes
