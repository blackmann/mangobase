import { Connection, Position } from 'reactflow'
import FlowHandle from './flow-handle'
import InOut from '../icons/InOut'
import { METHODS } from '../client/collection'
import styles from './service-node.module.css'

function ServiceNode() {
  function checkSourceConnection(connection: Connection) {
    return connection.source !== 'service'
  }

  function checkTargetConnection(connection: Connection) {
    return connection.target !== 'service'
  }

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
        {METHODS.map((method) => (
          <li key={method}>
            <FlowHandle
              id={`before-${method}`}
              position={Position.Left}
              type="target"
              isValidConnection={checkSourceConnection}
            />

            <div className={styles.methodLabel}>{method}</div>

            <FlowHandle
              id={`after-${method}`}
              position={Position.Right}
              type="source"
              isValidConnection={checkTargetConnection}
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
