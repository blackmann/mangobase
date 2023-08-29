import React from 'preact/compat'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'muted'

interface Props extends React.ComponentProps<'button'> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  muted: 'bg-slate-300 dark:bg-neutral-500 dark:text-white',
  primary: 'bg-blue-500 text-white',
  secondary: 'bg-green-500 text-white',
}

function Button({ className, variant = 'muted', ...props }: Props) {
  const style = styles[variant]
  return (
    <button
      className={clsx('py-1 px-2 rounded-md font-medium', style, className)}
      {...props}
    />
  )
}

export default Button
