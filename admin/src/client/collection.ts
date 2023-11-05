import type App from './app'
import { ReactFlowJsonObject } from 'reactflow'
import type { Index, SchemaDefinitions } from 'mangobase'
import qs from 'qs'

type Editor = ReactFlowJsonObject

interface CollectionProps {
  name: string
  schema: SchemaDefinitions
  exposed: boolean
  readOnlySchema?: boolean
  template: boolean
  indexes: Index[]
}

class Collection {
  app: App
  name: string
  schema: SchemaDefinitions
  exposed: boolean
  template: boolean
  readOnlySchema?: boolean
  indexes: Index[]

  constructor(app: App, data: CollectionProps) {
    this.app = app

    this.name = data.name
    this.schema = data.schema
    this.exposed = data.exposed
    this.template = data.template
    this.readOnlySchema = data.readOnlySchema
    this.indexes = data.indexes
  }

  private get base() {
    if (this.exposed) {
      return this.name
    }

    return `_x/${this.name}`
  }

  async find(query: Record<string, any> = {}) {
    const endpoint = this.getEndpoint(`/${this.base}`, query)

    const { data } = await this.app.req.get(endpoint)
    return data
  }

  async hooks(): Promise<HooksConfig> {
    const { data } = await this.app.req.get(`/_dev/hooks/${this.name}`)
    return data
  }

  async editor() {
    const { data } = await this.app.req.get(`/_dev/editors/${this.name}`)
    return data as Editor
  }

  async setHooks(hooks: HooksConfig) {
    await this.app.req.patch(`/_dev/hooks/${this.name}`, hooks)
  }

  async setEditor(editor: Editor) {
    await this.app.req.patch(`/_dev/editors/${this.name}`, editor)
  }

  private getEndpoint(path: string, filter: Record<string, any> = {}) {
    const endpointParts = [path]
    const queryString = qs.stringify(filter)

    if (queryString) {
      endpointParts.push(queryString)
    }

    return endpointParts.join('?')
  }
}

const HOOK_STAGES = ['before', 'after'] as const
const METHODS = ['find', 'get', 'create', 'patch', 'remove'] as const

type Stage = `${(typeof HOOK_STAGES)[number]}`
type Method = `${(typeof METHODS)[number]}`
type HookId = string
type HookOptions = Record<string, any>
type Hook = [HookId, HookOptions?]
type HooksConfig = Record<Stage, Partial<Record<Method, Hook[]>>>

export default Collection
export { HOOK_STAGES, METHODS }
export type { CollectionProps, Stage, Method, HookOptions, Hook, HooksConfig }
