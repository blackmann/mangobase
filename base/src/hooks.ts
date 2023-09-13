import { Hook, HookFn } from './hook'
import { MethodNotAllowed } from './errors'

const LogData: Hook = {
  description: 'Logs data. Check logs console.',
  id: 'log-data',
  name: 'Log data',
  run: async (ctx) => {
    console.log(ctx.path, ctx.method, ctx.data)
    return ctx
  },
}

const RestrictMethod: Hook = {
  configSchema: {
    allowDevs: { type: 'boolean' },
  },
  description: 'Restrict access to connected method',
  id: 'restrict-method',
  name: 'Restrict method',
  run: async (ctx, config) => {
    if (config?.allowDevs && ctx.user?.role === 'dev') {
      return ctx
    }

    throw new MethodNotAllowed()
  },
}

const CustomCode: Hook = {
  configSchema: {
    code: {
      defaultValue: `return async (ctx, app) => {
  return ctx
}`,
      required: true,
      treatAs: 'code',
      type: 'string',
    },
  },
  description: 'Run custom code',
  id: 'custom-code',
  name: 'Custom Code',
  async run(ctx, config, app) {
    if (!config) {
      return ctx
    }

    // we need to warm up the code
    // config stays the same between runs, unless the hook is
    // updated
    if (!config.exec) {
      config.exec = new Function(config.code)() as HookFn
    }

    return await config.exec(ctx, app)
  },
}

const allHooks = [LogData, CustomCode, RestrictMethod]

export default allHooks

export { LogData }
