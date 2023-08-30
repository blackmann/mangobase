import React from 'preact/compat'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'muted'

interface Props extends React.ComponentProps<'button'> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  muted: 'bg-slate-300 dark:bg-neutral-500 dark:text-neutral-100',
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-75 disabled:hover:bg-blue-600',
  secondary: 'bg-green-500 text-white',
}

function Button({ className, variant = 'muted', ...props }: Props) {
  const style = styles[variant]
  return (
    <button
      className={clsx(
        'py-1 px-2 rounded-md font-medium cursor-pointer disabled:cursor-not-allowed',
        style,
        className
      )}
      {...props}
    />
  )
}

export default Button
