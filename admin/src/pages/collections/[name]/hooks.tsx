import 'reactflow/dist/style.css'

import {
  Background,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  Panel,
  ReactFlow,
  ReactFlowInstance,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow'
import { CollectionRouteData } from '../../../routes'
import { HOOK_NODE_TYPE } from '../../../components/hook-node'
import HooksSearch from '../../../components/hooks-search'
import React from 'preact/compat'
import { SERVICE_NODE_TYPE } from '../../../components/service-node'
import nodeTypes from '../../../lib/node-types'
import randomStr from '../../../lib/random-str'
import styles from './hooks.module.css'
import { useRouteLoaderData } from 'react-router-dom'

const initialNodes = [
  {
    data: {},
    id: 'service',
    position: { x: 500, y: 300 },
    type: SERVICE_NODE_TYPE,
  },
]

const DEBOUNCE_THRESHOLD = 500

function CollectionHooks() {
  const { collection } = useRouteLoaderData('collection') as CollectionRouteData

  const [nodes, setNodes] = React.useState<Node[]>(initialNodes)
  const [edges, setEdges] = React.useState<Edge[]>([])

  const [flow, setFlow] = React.useState<ReactFlowInstance>()
  const saveDebounce = React.useRef<ReturnType<typeof setTimeout>>()

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

  React.useEffect(() => {
    if (!flow) {
      return
    }

    // load editor state
    collection.editor().then((editor) => {
      setNodes(editor.nodes)
      setEdges(editor.edges)
      flow.setViewport(editor.viewport)
    })
  }, [collection, flow])

  React.useEffect(() => {
    // save editor state
    if (!flow) {
      return
    }

    clearTimeout(saveDebounce.current)
    saveDebounce.current = setTimeout(() => {
      collection.setEditor(flow.toObject())
    }, DEBOUNCE_THRESHOLD)
  }, [collection, edges, flow, nodes])

  return (
    <div className={styles.flowWrapper}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        edges={edges}
        onInit={(instance: ReactFlowInstance) => setFlow(instance)}
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
