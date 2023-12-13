import { FieldValues, useForm } from 'react-hook-form'
import { NodeProps, Position, useReactFlow } from 'reactflow'
import React, { memo } from 'preact/compat'
import hooksRegistry, { Hook } from '@/data/hooks-registry'
import Button from './button'
import FlowHandle from './flow-handle'
import SchemaFields from './schema-fields'
import clsx from 'clsx'

interface Data {
  id: string
  config?: any
}

function HookNode({ data, id: nodeId, selected }: NodeProps<Data>) {
  const reactFlow = useReactFlow()
  const hookInfo = hooksRegistry.value.find(({ id }) => data.id === id)

  function handleConfigChange(config: any) {
    reactFlow.setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id !== nodeId) {
          return node
        }

        return {
          ...node,
          data: { ...node.data, config },
        }
      })
    )
  }

  if (!hookInfo) {
    return <div>Loading hook…</div>
  }

  return (
    <div
      className={clsx(
        'bg-zinc-50 dark:bg-neutral-700 w-[20rem] overflow-hidden rounded-md border border-zinc-200 dark:border-neutral-600',
        { 'border-zinc-400 dark:!border-neutral-400': selected }
      )}
    >
      <div className="flex items-center py-2">
        <FlowHandle
          id={`in-${nodeId}`}
          position={Position.Left}
          type="target"
        />

        <header className="flex-1 flex">
          <div className="me-2 text-secondary">
            <span className="material-symbols-rounded">line_start_circle</span>
          </div>
          <div>
            <div>{hookInfo.name}</div>
            <p className="text-secondary">
              {hookInfo.description}
            </p>
          </div>
        </header>

        <FlowHandle
          id={`out-${nodeId}`}
          type="source"
          position={Position.Right}
        />
      </div>
      {hookInfo.configSchema && (
        <ConfigForm
          config={data.config}
          hookInfo={hookInfo}
          onSave={handleConfigChange}
        />
      )}
    </div>
  )
}

interface ConfigFormProps {
  hookInfo: Hook
  config: any
  onSave: (config: any) => void
}

const ConfigForm = memo(({ config, hookInfo, onSave }: ConfigFormProps) => {
  const { control, handleSubmit, register, setValue, watch } = useForm()

  const showSave =
    config !== null && JSON.stringify(watch()) !== JSON.stringify(config)

  function saveConfig(form: FieldValues) {
    onSave(form)
  }

  React.useEffect(() => {
    if (!config) {
      return
    }

    for (const [key] of Object.entries(hookInfo.configSchema)) {
      setValue(key, config[key])
    }
  }, [config, hookInfo, setValue])

  return (
    <form className="ms-6 mb-2 me-6" onSubmit={handleSubmit(saveConfig)}>
      <SchemaFields
        control={control}
        register={register}
        schema={hookInfo.configSchema}
      />

      {showSave && (
        <div className="mt-2">
          <Button className="font-sm" variant="secondary">
            Save
          </Button>
        </div>
      )}
    </form>
  )
})

const HOOK_NODE_TYPE = 'hook-node-type'

export default memo(HookNode)
export { HOOK_NODE_TYPE }
