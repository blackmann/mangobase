import { Handle, Position } from 'reactflow'
import type { HandleComponentProps } from '@reactflow/core/dist/esm/components/Handle'
import clsx from 'clsx'
import styles from './flow-handle.module.css'

function FlowHandle({ className, ...props }: HandleComponentProps) {
  return (
    <Handle
      {...props}
      className={clsx(
        styles.handle,
        { [styles.out]: props.position === Position.Right },
        className
      )}
    />
  )
}

export default FlowHandle
