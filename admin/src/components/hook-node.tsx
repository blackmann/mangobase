import { NodeProps, Position } from 'reactflow'
import FlowHandle from './flow-handle'
import clsx from 'clsx'
import hooksRegistry from '../data/hooks-registry'

interface Data {
  id: string
}

function HookNode({ data, id: nodeId, selected }: NodeProps<Data>) {
  const hookInfo = hooksRegistry.value.find(({ id }) => data.id === id)

  if (!hookInfo) {
    return <div>Loading hook…</div>
  }

  return (
    <div
      className={clsx(
        'bg-slate-50 dark:bg-neutral-700 w-[20rem] overflow-hidden rounded-md border border-slate-200 dark:border-neutral-600',
        { 'border-slate-400 dark:border-neutral-400': selected }
      )}
    >
      <div className="flex items-center py-2">
        <FlowHandle
          id={`in-${nodeId}`}
          position={Position.Left}
          type="target"
        />

        <header className="flex-1 flex">
          <div className="me-2 text-slate-500 dark:text-neutral-400">
            <span className="material-symbols-rounded">line_start_circle</span>
          </div>
          <div>
            <div>{hookInfo.name}</div>
            <p className="text-slate-500 dark:text-neutral-400">
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
    </div>
  )
}

const HOOK_NODE_TYPE = 'hook-node-type'

export default HookNode
export { HOOK_NODE_TYPE }
