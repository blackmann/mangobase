import React from 'preact/compat'
import clsx from 'clsx'

interface Props extends React.PropsWithChildren {
  className?: string
}

function Chip({ children, className }: Props) {
  return (
    <div
      className={clsx(
        'bg-slate-200 dark:bg-neutral-700 inline-flex rounded-md py-1 px-2 font-medium',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Chip
