import { NavLink, Outlet } from 'react-router-dom'
import Box from '../icons/Box'
import Debug from '../icons/Debug'
import Options from '../icons/Options'
import Doc from '../icons/Doc'
import styles from './AdminLayout.module.css'
import clsx from 'clsx'

const navLinks = [
  {
    title: 'Collections',
    href: '/collections',
    icon: <Box />,
  },
  {
    title: 'Logs',
    href: '/logs',
    icon: <Debug />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Options />,
  },
  {
    title: 'Docs',
    href: '/docs',
    icon: <Doc />,
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
                  clsx('text-secondary', styles.navLink, { [styles.active]: isActive })
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
