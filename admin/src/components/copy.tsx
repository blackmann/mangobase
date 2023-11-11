import React from 'preact/compat'
import clsx from 'clsx'

interface Props {
  className?: string
  title?: string
  value: string
}

function Copy({ value, className, title }: Props) {
  const [copied, setCopied] = React.useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span
      className={clsx(
        'material-symbols-rounded cursor-pointer text-secondary',
        { '!text-pink-500': copied },
        className
      )}
      onClick={copy}
      title={title || 'Copy to clipboard'}
    >
      {copied ? 'done' : 'content_copy'}
    </span>
  )
}

export default Copy
