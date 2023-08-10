import 'reactflow/dist/style.css'

import {
  Background,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  Panel,
  ReactFlow,
  ReactFlowInstance,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow'
import { Hook, HooksConfig, METHODS } from '../../../client/collection'
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

class Tree {
  private edges: Edge[]
  private nodes: Node[]

  constructor(edges: Edge[], nodes: Node[]) {
    this.edges = edges
    this.nodes = nodes
  }

  ancestor(connection: Edge) {
    return this.edges.find(
      (edge) => edge.source !== 'service' && edge.target === connection?.source
    )
  }

  *ancestry(targetHandle: string) {
    let currentConnection = this.edges.find(
      (edge) => edge.targetHandle === targetHandle
    )

    while (currentConnection) {
      const node = this.nodes.find(
        (node) => node.id === currentConnection?.source
      )

      yield [node, currentConnection]

      currentConnection = this.ancestor(currentConnection)
    }
  }

  descendant(connection: Edge) {
    return this.edges.find(
      (edge) => edge.target !== 'service' && edge.source === connection?.target
    )
  }

  *descent(sourceHandle: string) {
    let currentConnection = this.edges.find(
      (edge) => edge.sourceHandle === sourceHandle
    )

    while (currentConnection) {
      const node = this.nodes.find(
        (node) => node.id === currentConnection?.target
      )

      yield [node, currentConnection]

      currentConnection = this.descendant(currentConnection)
    }
  }
}

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

  const onConnect = React.useCallback((connection: Connection) => {
    setEdges((edges) => {
      edges = edges.filter((edge) => {
        if (connection.source === 'service') {
          return edge.sourceHandle !== connection.sourceHandle
        }

        return (
          `${edge.target}-${edge.targetHandle}` !==
          `${connection.target}-${connection.targetHandle}`
        )
      })
      return addEdge(connection, edges)
    })
  }, [])

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

  React.useEffect(() => {
    console.log(edges, nodes)

    const tree = new Tree(edges, nodes)

    const serviceHooks: HooksConfig = {
      after: {},
      before: {},
    }

    for (const method of METHODS) {
      const targetHandle = `before-${method}`
      const beforeHooks: Hook[] = []

      for (const [node] of tree.ancestry(targetHandle)) {
        beforeHooks.push([node?.data.id])
      }

      serviceHooks['before'][method] = beforeHooks

      const sourceHandle = `after-${method}`
      const afterHooks: Hook[] = []

      for (const [node] of tree.descent(sourceHandle)) {
        afterHooks.push([node?.data.id])
      }

      serviceHooks['after'][method] = afterHooks
    }

    console.log('servicehooks', serviceHooks)
  }, [edges, nodes])

  return (
    <div className={styles.flowWrapper}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        onConnect={onConnect}
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
