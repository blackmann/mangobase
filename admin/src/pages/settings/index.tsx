import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import styles from './index.module.css'

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
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          <header className={styles.navHeader}>Settings</header>
          <nav className={styles.nav}>
            <ul>
              {links.map((link) => (
                <li key={link.path}>
                  <NavLink
                    className={({ isActive }: { isActive: boolean }) =>
                      clsx('text-secondary', styles.navLink, {
                        [styles.active]: isActive,
                      })
                    }
                    to={link.path}
                  >
                    {link.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="col-md-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Settings
