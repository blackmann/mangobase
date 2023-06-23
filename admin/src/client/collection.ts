import type App from './app'

type Schema = Record<string, any>

interface CollectionProps {
  name: string
  schema: Schema
}

class Collection {
  app: App
  name: string
  schema: Schema

  constructor(app: App, data: CollectionProps) {
    this.app = app

    this.name = data.name
    this.schema = data.schema
  }

  async find() {
    const { data } = await this.app.req.get(`/${this.name}`)
    return data
  }

  async hooks() {
    const { data } = await this.app.req.get(`/hooks/${this.name}`)
    return data
  }

  async setHooks(hooks: HooksConfig) {
    await this.app.req.patch(`/hooks/${this.name}`, hooks)
  }
}

const hookStages = ['before', 'after'] as const
const methods = ['find', 'get', 'create', 'patch', 'remove'] as const

type Stage = `${(typeof hookStages)[number]}`
type Method = `${(typeof methods)[number]}`
type HookId = string
type HookOptions = Record<string, any>
type Hook = [HookId, HookOptions?]
type HooksConfig = Record<Stage, Partial<Record<Method, Hook[]>>>

export default Collection
export { hookStages, methods }
export type { CollectionProps, Stage, Method, HookOptions, Hook, HooksConfig }
