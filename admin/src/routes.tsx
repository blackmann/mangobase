import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import CollectionsPage from './pages/collections'
import CollectionDetail, { CollectionRecords } from './pages/collections/[name]'
import CollectionHooks from './pages/collections/[name]/hooks'
import app from './mangobase-app'

const routes = createBrowserRouter(
  [
    {
      path: '',
      element: <AdminLayout />,
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
