import NavContentLayout from '../../layouts/NavContentLayout'
import NavLinks from '../../components/nav-links'
import { Outlet } from 'react-router-dom'

const links = [
  {
    path: 'schemas',
    title: 'Validation Schemas',
  },
  {
    path: 'devs',
    title: 'Devs',
  },
  {
    path: 'profile',
    title: 'Profile',
  },
]

function Settings() {
  return (
    <NavContentLayout
      nav={
        <>
          <header className="text-base font-bold">Settings</header>

          <NavLinks links={links} />
        </>
      }
    >
      <Outlet />
    </NavContentLayout>
  )
}

export default Settings
