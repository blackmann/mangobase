import { Hook } from './hook'

const LogData: Hook = {
  description: 'Logs data. Check logs console.',
  id: 'log-data',
  name: 'Log data',
  run: async (ctx) => {
    console.log(ctx.path, ctx.method, ctx.data)
    return ctx
  },
}

const allHooks = [LogData]

export default allHooks

export { LogData }
