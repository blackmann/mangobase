import React from 'preact/compat'
import clsx from 'clsx'

type Props = React.ComponentProps<'input'>

const Input = React.forwardRef(
  (
    { className, ...props }: Props,
    ref?: React.ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <input
        className={clsx(
          'border border-slate-300 dark:border-neutral-600 rounded-md py-1 px-2 outline-none bg-slate-200 dark:bg-neutral-700 focus:border-slate-400 dark:focus:border-neutral-500 placeholder:text-slate-400 placeholder:dark:text-neutral-400',
          className
        )}
        {...props}
        ref={ref}
      />
    )
  }
)

export default Input
