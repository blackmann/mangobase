import HookNode, { HOOK_NODE_TYPE } from '../components/hook-node'
import ServiceNode, { SERVICE_NODE_TYPE } from '../components/service-node'

const nodeTypes = {
  [HOOK_NODE_TYPE]: HookNode,
  [SERVICE_NODE_TYPE]: ServiceNode,
}

export default nodeTypes
