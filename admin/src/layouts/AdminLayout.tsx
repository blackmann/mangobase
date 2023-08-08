import { NavLink, Outlet } from 'react-router-dom'
import Box from '../icons/Box'
import Debug from '../icons/Debug'
import Doc from '../icons/Doc'
import Options from '../icons/Options'
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
      </nav>

      <main class="flex-fill">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
