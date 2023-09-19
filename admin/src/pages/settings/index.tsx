import NavContentLayout from '../../layouts/NavContentLayout'
import NavLinks from '../../components/nav-links'
import { Outlet } from 'react-router-dom'

const links = [
  {
    path: 'devs',
    title: 'Devs',
  },
  {
    children: Promise.resolve([
      { path: 'schemas/users', title: 'Users' },
      { path: 'schemas/roles', title: 'Roles' },
    ]),
    path: 'schemas',
    title: 'Validation Schemas',
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
