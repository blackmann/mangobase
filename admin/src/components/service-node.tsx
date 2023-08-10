import { Handle, Position } from 'reactflow'
import InOut from '../icons/InOut'
import { methods } from '../client/collection'
import styles from './service-node.module.css'
import clsx from 'clsx'

function ServiceNode() {
  return (
    <div className={styles.serviceNode}>
      <header className={styles.header}>
        <div className="me-1 text-secondary">
          <InOut />
        </div>

        <div>
          <div className="bold">Service node</div>
          <div className="text-secondary">Methods</div>
        </div>
      </header>

      <ul className={styles.methods}>
        {methods.map((method) => (
          <li key={method}>
            <Handle
              id={`before-${method}`}
              className={styles.handle}
              position={Position.Left}
              type="target"
            />

            <div className={styles.methodLabel}>{method}</div>

            <Handle
              id={`after-${method}`}
              className={clsx(styles.handle, styles.out)}
              position={Position.Right}
              type="target"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

const SERVICE_NODE_TYPE = 'service-node-type'

export default ServiceNode
export { SERVICE_NODE_TYPE }
