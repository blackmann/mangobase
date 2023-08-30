import { Connection, Position } from 'reactflow'
import FlowHandle from './flow-handle'
import { METHODS } from '../client/collection'

function ServiceNode() {
  function checkSourceConnection(connection: Connection) {
    return connection.source !== 'service'
  }

  function checkTargetConnection(connection: Connection) {
    return connection.target !== 'service'
  }

  return (
    <div className="bg-slate-50 dark:bg-neutral-700 rounded-md w-[16rem] border border-slate-200 dark:border-neutral-600 overflow-hidden">
      <header className="flex p-2 border-b border-b-slate-200 dark:border-b-neutral-600">
        <div className="me-1 text-slate-500 dark:text-neutral-400">
          <span className="material-symbols-rounded">sync_alt</span>
        </div>

        <div>
          <div className="font-bold">Service node</div>
          <div className="text-slate-500 dark:text-neutral-400">Methods</div>
        </div>
      </header>

      <ul className="list-none">
        {METHODS.map((method) => (
          <li className="flex items-center py-2" key={method}>
            <FlowHandle
              id={`before-${method}`}
              position={Position.Left}
              type="target"
              isValidConnection={checkSourceConnection}
            />

            <div className="flex-1 ms-6">{method}</div>

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
