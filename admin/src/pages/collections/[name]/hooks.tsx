import 'reactflow/dist/style.css'

import { Background, Panel, ReactFlow } from 'reactflow'
import HooksSearch from '../../../components/hooks-search'
import { SERVICE_NODE_TYPE } from '../../../components/service-node'
import nodeTypes from '../../../lib/node-types'
import styles from './hooks.module.css'

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, type: SERVICE_NODE_TYPE },
]
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]

function CollectionHooks() {
  return (
    <div className={styles.flowWrapper}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={initialNodes}
        edges={initialEdges}
      >
        <Background />
        <Panel position="top-left">
          <HooksSearch />
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default CollectionHooks
