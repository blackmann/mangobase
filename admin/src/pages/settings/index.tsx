import { NavLink, Outlet } from 'react-router-dom'

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
          <nav>
            <ul>
              {links.map((link) => (
                <li key={link.path}>
                  <NavLink to={link.path}>{link.title}</NavLink>
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
