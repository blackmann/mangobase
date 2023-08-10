import FlowHandle from './flow-handle'
import LineStart from '../icons/LineStart'
import { Position } from 'reactflow'
import hooksRegistry from '../data/hooks-registry'
import styles from './hook-node.module.css'

interface Props {
  data: { id: string }
}

function HookNode({ data }: Props) {
  const hookInfo = hooksRegistry.value.find(({ id }) => data.id === id)

  if (!hookInfo) {
    return <div>Loading hook…</div>
  }

  return (
    <div className={styles.hookNode}>
      <div className={styles.head}>
        <FlowHandle
          id={`in-${data.id}`}
          position={Position.Left}
          type="target"
        />

        <header>
          <div className="me-2 text-secondary">
            <LineStart />
          </div>
          <div>
            <div className={styles.hookTitle}>{hookInfo.name}</div>
            <p className="text-secondary m-0">{hookInfo.description}</p>
          </div>
        </header>

        <FlowHandle
          id={`out-${data.id}`}
          type="source"
          position={Position.Right}
        />
      </div>
    </div>
  )
}

const HOOK_NODE_TYPE = 'hook-node-type'

export default HookNode
export { HOOK_NODE_TYPE }
