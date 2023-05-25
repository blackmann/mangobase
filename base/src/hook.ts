import App from './app'
import type { Context } from './context'
import { Definition } from './schema'
import Method from './method'

type Config = Record<string, any>

type HookFn = (
  ctx: Context,
  config: Config | undefined,
  app: App
) => Promise<Context>

interface Hook {
  id: string
  name: string
  description?: string
  config?: Config
  configSchema?: Record<string, Definition>
  run: HookFn
}

type Hooks = {
  after: Record<`${Method}`, [HookFn, Config?][]>
  before: Record<`${Method}`, [HookFn, Config?][]>
}

export type { Hook, HookFn, Hooks, Config as HookConfig }
