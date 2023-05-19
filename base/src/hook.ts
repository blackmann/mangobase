import App from './app'
import Context from './context'
import { Definition } from './schema'

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

export type { Hook, HookFn, Config as HookConfig }
