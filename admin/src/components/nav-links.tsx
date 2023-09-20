import { NavLink } from 'react-router-dom'
import React from 'preact/compat'
import clsx from 'clsx'

type LinkProp = {
  path: string
  title: string
}

interface Props {
  links: (LinkProp & {
    // no nesting above 2 levels
    children?: LinkProp[]
  })[]
}

function L({
  expanded,
  hasChildren,
  link,
  onClick,
}: {
  expanded?: boolean
  hasChildren?: boolean
  link: LinkProp
  onClick?: () => void
}) {
  return (
    <div className="flex justify-between items-center">
      <NavLink
        className={({ isActive }: { isActive: boolean }) =>
          clsx(
            'text-slate-500 dark:text-neutral-400 no-underline px-0 hover:underline hover:text-slate-800 dark:hover:!text-neutral-200',
            {
              'text-slate-800 dark:!text-neutral-200 !underline': isActive,
            }
          )
        }
        to={link.path}
        onClick={onClick}
      >
        {link.title}
      </NavLink>

      {hasChildren && (
        <span className="material-symbols-rounded leading-none text-sm text-slate-500 dark:text-neutral-400">
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
      )}
    </div>
  )
}

function LinkItem({
  link,
  children,
}: {
  link: LinkProp
  children?: LinkProp[]
}) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div>
      <L
        link={link}
        onClick={() => setExpanded((v) => !v)}
        hasChildren={Boolean(children?.length)}
        expanded={expanded}
      />

      {children && expanded && (
        <ol className="list-none p-0 ms-3">
          {children.map((link) => (
            <li key={link.title}>
              <L link={link} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function NavLinks({ links }: Props) {
  return (
    <ol className="list-none p-0">
      {links.map((link) => (
        <li key={link.title}>
          <LinkItem children={link.children} link={link} />
        </li>
      ))}
    </ol>
  )
}

export default NavLinks
