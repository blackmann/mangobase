import { NavLink, Outlet } from 'react-router-dom'

const navLinks = [
  {
    title: 'Collections',
    href: '/collections',
  },
  {
    title: 'Logs',
    href: '/logs',
  },
  {
    title: 'Settings',
    href: '/settings',
  },
  {
    title: 'Docs',
    href: '/docs',
  },
]

function AdminLayout() {
  return (
    <div>
      <nav>
        <ul>
          {navLinks.map((link) => (
            <li key={link.href}>
              <NavLink to={link.href}>{link.title}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main><Outlet /></main>
    </div>
  )
}

export default AdminLayout
