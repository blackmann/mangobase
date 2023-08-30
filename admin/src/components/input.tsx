import React from 'preact/compat'
import { Ref } from 'preact'
import clsx from 'clsx'

type Props = React.ComponentProps<'input'>

const Input = React.forwardRef(
  ({ className, ...props }: Props, ref?: Ref<HTMLInputElement>) => {
    return (
      <input
        className={clsx(
          'border border-slate-300 dark:border-neutral-600 rounded-lg py-1 px-2 outline-none bg-slate-200 dark:bg-neutral-800',
          className
        )}
        {...props}
        ref={ref}
      />
    )
  }
)

export default Input
