import React from 'preact/compat'
import clsx from 'clsx'

interface Props extends React.PropsWithChildren {
  className?: string
  title?: string
}

function Chip({ children, className, title }: Props) {
  return (
    <div
      className={clsx(
        'bg-zinc-200 dark:bg-neutral-700 inline-flex rounded-md py-1 px-2 font-medium',
        className
      )}
      title={title}
    >
      {children}
    </div>
  )
}

export default Chip
