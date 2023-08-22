import type App from './app'
import { ReactFlowJsonObject } from 'reactflow'

type Schema = Record<string, any>
type Editor = ReactFlowJsonObject

interface CollectionProps {
  name: string
  schema: Schema
  exposed: boolean
  template: boolean
}

class Collection {
  app: App
  name: string
  schema: Schema
  exposed: boolean
  template: boolean

  constructor(app: App, data: CollectionProps) {
    this.app = app

    this.name = data.name
    this.schema = data.schema
    this.exposed = data.exposed
    this.template = data.template
  }

  private get base() {
    if (this.exposed) {
      return this.name
    }

    return `_x/${this.name}`
  }

  async find() {
    const { data } = await this.app.req.get(`/${this.base}`)
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
