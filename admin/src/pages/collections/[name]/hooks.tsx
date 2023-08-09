import 'reactflow/dist/style.css'

import { Background, ReactFlow } from 'reactflow'
import { HooksConfig, Method, Stage } from '../../../client/collection'
import type Collection from '../../../client/collection'
import React from 'preact/compat'
import { SERVICE_NODE_TYPE } from '../../../components/service-node'
import { loadHooksRegistry } from '../../../data/hooks-registry'
import nodeTypes from '../../../lib/node-types'
import styles from './hooks.module.css'
import { useForm } from 'react-hook-form'
import { useRouteLoaderData } from 'react-router-dom'

type RouteData = { collection: Collection }

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, type: SERVICE_NODE_TYPE },
]
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]

function CollectionHooks() {
  const { collection } = useRouteLoaderData('collection') as RouteData

  const { getValues, watch } = useForm({
    defaultValues: {
      hook: '__none',
      method: 'find',
      stage: 'before',
    },
  })

  const [config, setConfig] = React.useState<HooksConfig>({
    after: {},
    before: {},
  })

  function addHook() {
    const { stage, method, hook } = getValues()
    const stage_ = stage as Stage
    const method_ = method as Method

    setConfig((config) => {
      const existing = config[stage_][method_] || []
      if (existing.find((e) => e[0] === hook)) {
        return config
      }

      config[stage_][method_] = [...existing, [hook]]

      return { ...config }
    })
  }

  async function save() {
    await collection.setHooks(config)
  }

  React.useEffect(() => {
    loadHooksRegistry()
    collection.hooks().then((hooks) => setConfig(hooks))
  }, [collection])

  const $stage = watch('stage')
  const $method = watch('method')

  const hooks = config[$stage as Stage][$method as Method] || []

  return (
    <div className={styles.flowWrapper}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={initialNodes}
        edges={initialEdges}
      >
        <Background />
      </ReactFlow>
    </div>
  )
}

export default CollectionHooks
