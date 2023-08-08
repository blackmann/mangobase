import React from 'preact/compat'
import styles from './chip.module.css'

function Chip({ children }: React.PropsWithChildren) {
  return <div className={styles.chip}>{children}</div>
}

export default Chip
