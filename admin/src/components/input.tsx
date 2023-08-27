import React from 'preact/compat'
import clsx from 'clsx'

type Props = React.ComponentProps<'input'>

function Input({ className, ...props }: Props) {
  return (
    <input
      className={clsx(
        'border dark:border-gray-500 rounded-lg py-1 px-2 outline-none',
        className
      )}
      {...props}
    />
  )
}

export default Input
