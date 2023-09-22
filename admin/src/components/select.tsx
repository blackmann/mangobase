import React from 'preact/compat'
import clsx from 'clsx'

type Props = React.ComponentProps<'select'>

const Select = React.forwardRef(
  (
    { className, ...props }: Props,
    ref: React.ForwardedRef<HTMLSelectElement>
  ) => {
    return (
      <select
        className={clsx(
          'appearance-none bg-zinc-200 border dark:bg-neutral-700 border-zinc-300 dark:border-neutral-600 px-2 py-1 rounded-md',
          className
        )}
        {...props}
        ref={ref}
      />
    )
  }
)

export default Select
