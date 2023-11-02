import React from 'preact/compat'
import clsx from 'clsx'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={clsx(
          'border border-zinc-300 dark:border-neutral-600 rounded-md py-1 px-2 outline-none bg-zinc-200 dark:bg-neutral-700 focus:border-zinc-400 dark:focus:border-neutral-500 placeholder:text-zinc-400 placeholder:dark:text-neutral-400 focus:ring-0',
          { 'rounded-md w-4 h-4': props.type === 'checkbox' },
          className
        )}
        {...props}
        ref={ref}
      />
    )
  }
)

export default Input
