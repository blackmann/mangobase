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
import styles from './AdminLayout.module.css'

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
    <div className="d-flex">
      <nav class={styles.nav}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.href}>
              <NavLink
                className={({ isActive }: { isActive: boolean }) =>
                  clsx('text-secondary', styles.navLink, {
                    [styles.active]: isActive,
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

        <ul>
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

      <main class="flex-fill">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
