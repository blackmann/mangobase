import { NavLink } from 'react-router-dom'
import React from 'preact/compat'
import clsx from 'clsx'

type LinkProp = {
  leading?: React.ReactNode
  path: string
  title: React.ReactNode
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
    <NavLink
      className={({ isActive }: { isActive: boolean }) =>
        clsx(
          'group flex justify-between items-center text-secondary no-underline px-0 hover:text-zinc-800 dark:hover:!text-neutral-200',
          {
            'text-zinc-800 dark:!text-neutral-200 is-active': isActive,
          }
        )
      }
      to={link.path}
      onClick={onClick}
    >
      <div className="flex items-center">
        {link.leading}

        <span className="group-hover:last:underline group-[.is-active]:!underline">
          {link.title}
        </span>
      </div>

      {hasChildren && (
        <span className="material-symbols-rounded leading-none text-md text-zinc-400 dark:text-neutral-500">
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
      )}
    </NavLink>
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
        <ol className="list-none p-0 ms-6">
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
