import { Hook } from './hook'
import Schema from './schema'
import allHooks from './hooks'

class HooksRegistry {
  private registry: Record<string, Hook> = {}

  constructor() {
    for (const hook of allHooks) {
      this.registry[hook.id] = hook
    }
  }

  register(hook: Hook) {
    if (hook.configSchema) {
      Schema.validateSchema(hook.configSchema)
    }

    if (this.registry[hook.id]) {
      throw new Error(`A hook with id ${hook.id} is already registered`)
    }

    this.registry[hook.id] = hook
  }

  get(id: string): Hook {
    const hook = this.registry[id]
    if (!hook) {
      throw new Error(`Hook ${id} not found`)
    }
    return hook
  }

  list(): Hook[] {
    return Object.values(this.registry)
  }
}

export default HooksRegistry
