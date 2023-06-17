import React from 'preact/compat'
import { NavLink } from 'react-router-dom'

interface Props extends React.PropsWithChildren {}

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

function AdminLayout({ children }: Props) {
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
      <main>{children}</main>
    </div>
  )
}

export default AdminLayout
