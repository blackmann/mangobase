import { RouterProvider } from 'react-router-dom'
import { Snacks } from './components/snacks'
import routes from './routes'

export function App() {
  return (
    <>
      <RouterProvider router={routes} />
      <Snacks />
    </>
  )
}
