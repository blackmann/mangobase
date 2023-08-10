import 'reactflow/dist/style.css'

import {
  Background,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  Panel,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow'
import { HOOK_NODE_TYPE } from '../../../components/hook-node'
import HooksSearch from '../../../components/hooks-search'
import React from 'preact/compat'
import { SERVICE_NODE_TYPE } from '../../../components/service-node'
import nodeTypes from '../../../lib/node-types'
import randomStr from '../../../lib/random-str'
import styles from './hooks.module.css'

const initialNodes = [
  {
    data: {},
    id: 'service',
    position: { x: 500, y: 300 },
    type: SERVICE_NODE_TYPE,
  },
]

function CollectionHooks() {
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes)
  const [edges, setEdges] = React.useState<Edge[]>([])

  const onNodesChange = React.useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodes) => applyNodeChanges(changes, nodes)),
    []
  )

  const onEdgesChange = React.useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edges) => applyEdgeChanges(changes, edges)),
    []
  )

  function addHook(hookId: string) {
    setNodes((nodes) => [
      ...nodes,
      {
        data: { id: hookId },
        id: randomStr(),
        position: { x: 100, y: 200 },
        type: HOOK_NODE_TYPE,
      },
    ])
  }

  return (
    <div className={styles.flowWrapper}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        edges={edges}
      >
        <Background />
        <Panel position="top-left">
          <HooksSearch onSelect={addHook} />
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default CollectionHooks
