import React from 'preact/compat'
import clsx from 'clsx'
import styles from './chip.module.css'

interface Props extends React.PropsWithChildren {
  className?: string
}

function Chip({ children, className }: Props) {
  return <div className={clsx(styles.chip, className)}>{children}</div>
}

export default Chip
