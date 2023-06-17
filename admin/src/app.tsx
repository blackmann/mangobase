import { Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import CollectionsPage from './pages/collections'

export function App() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="*" element={<>Come back later</>} />
      </Routes>
    </AdminLayout>
  )
}
