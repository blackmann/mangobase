import App from './app'
import CollectionService from './collection-service'
import { HookFn } from './hook'
import Schema from './schema'

const getPath = () => App.onDev`logs`

async function logger(app: App) {
  const schema = new Schema(
    {
      category: { required: true, type: 'string' },
      data: { type: 'any' },
      label: { required: true, type: 'string' },
      status: { type: 'number' },
      time: { type: 'number' },
    },
    { parser: app.database.cast }
  )
  const service = new CollectionService(app, '_logs', { schema })

  app.use(getPath(), service)
}

const logStart: HookFn = async (ctx) => {
  ctx.locals['reqstart'] = Date.now()
  return ctx
}

const logEnd: HookFn = async (ctx, _, app) => {
  const service = app.service(getPath()) as CollectionService
  // [ ] Pass log values
  await service.collection.create({
    category: ctx.method,
    data: (ctx.statusCode || 200) > 399 ? ctx.result : undefined,
    label: ctx.url,
    status: ctx.statusCode,
    time: Date.now() - ctx.locals['reqstart'],
  })

  return ctx
}

export default logger
export { logEnd, logStart }
