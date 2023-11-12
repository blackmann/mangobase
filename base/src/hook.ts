import App from './app.js'
import type { Context } from './context.js'
import { type Definition } from './schema.js'
import type Method from './method.js'

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
  configSchema?: Record<string, Definition>
  run: HookFn
}

type Hooks = {
  after: Record<`${Method}`, [HookFn, Config?][]>
  before: Record<`${Method}`, [HookFn, Config?][]>
}

export type { Hook, HookFn, Hooks, Config as HookConfig }
