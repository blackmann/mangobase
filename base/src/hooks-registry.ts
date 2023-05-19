import { Hook } from './hook'

class HooksRegistry {
  private registry: Record<string, Hook> = {}

  register(hook: Hook) {
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
