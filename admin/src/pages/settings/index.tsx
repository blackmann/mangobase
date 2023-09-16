import { NavLink, Outlet } from 'react-router-dom'
import NavContentLayout from '../../layouts/NavContentLayout'
import clsx from 'clsx'
import NavLinks from '../../components/nav-links'

const links = [
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
