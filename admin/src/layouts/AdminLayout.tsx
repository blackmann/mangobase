import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import AVATAR_COLORS from '../lib/avatar-colors'
import Avatar from 'boring-avatars'
import Box from '../icons/Box'
import Debug from '../icons/Debug'
import Doc from '../icons/Doc'
import Options from '../icons/Options'
import React from 'preact/compat'
import app from '../mangobase-app'
import clsx from 'clsx'

const navLinks = [
  {
    href: '/collections',
    icon: <Box />,
    title: 'Collections',
  },
  {
    href: '/logs',
    icon: <Debug />,
    title: 'Logs',
  },
  {
    href: '/settings',
    icon: <Options />,
    title: 'Settings',
  },
  {
    href: '/docs',
    icon: <Doc />,
    title: 'Docs',
  },
]

function AdminLayout() {
  const navigate = useNavigate()
  const auth = app.get('auth')

  React.useEffect(() => {
    !auth && navigate('/login')
  }, [auth, navigate])

  if (!auth) {
    return null
  }

  const { user } = auth

  return (
    <div className="flex">
      <nav className="h-screen flex flex-col justify-between">
        <ul className="list-none m-2 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <NavLink
                className={({ isActive }: { isActive: boolean }) =>
                  clsx('text-gray-400 p-2 flex', {
                    'text-gray-700 dark:!text-gray-200': isActive,
                  })
                }
                to={link.href}
                title={link.title}
              >
                {link.icon}
              </NavLink>
            </li>
          ))}
        </ul>

        <ul className="list-none m-2 p-0">
          <li style={{ textAlign: 'center' }}>
            <NavLink to="/settings/profile">
              <Avatar
                colors={AVATAR_COLORS}
                name={user.username}
                variant="beam"
                size={32}
              />
            </NavLink>
          </li>
        </ul>
      </nav>

      <main class="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
