import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import AVATAR_COLORS from '../lib/avatar-colors'
import Avatar from 'boring-avatars'
import React from 'preact/compat'
import app from '../mangobase-app'
import clsx from 'clsx'

const navLinks = [
  {
    href: '/collections',
    icon: <span className="material-symbols-rounded">toolbar</span>,
    title: 'Collections',
  },
  {
    href: '/logs',
    icon: <span className="material-symbols-rounded">bug_report</span>,
    title: 'Logs',
  },
  {
    href: '/settings',
    icon: <span className="material-symbols-rounded">page_info</span>,
    title: 'Settings',
  },
  {
    href: '/docs',
    icon: <span className="material-symbols-rounded">article</span>,
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
