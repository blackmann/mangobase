import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

interface Props {
  links: {
    path: string
    title: string
  }[]
}

function NavLinks({ links }: Props) {
  return (
    <ol className="list-none p-0">
      {links.map((link) => (
        <li key={link.title}>
          <NavLink
            className={({ isActive }: { isActive: boolean }) =>
              clsx(
                'text-slate-500 dark:text-neutral-400 d-flex no-underline px-0 hover:underline',
                {
                  'text-slate-800 dark:!text-neutral-200 !underline': isActive,
                }
              )
            }
            to={link.path}
          >
            {link.title}
          </NavLink>
        </li>
      ))}
    </ol>
  )
}

export default NavLinks
