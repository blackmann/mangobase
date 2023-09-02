import App from './app'
import CollectionService from './collection-service'
import { HookFn } from './hook'
import { MethodNotAllowed } from './errors'
import Schema from './schema'

const getPath = () => App.onDev('logs')
const getStatsPath = () => App.onDev('log-stats')

async function logger(app: App) {
  const collectionName = '_logs'

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
  const service = new CollectionService(app, collectionName, { schema })

  app.use(getStatsPath(), async (ctx, app) => {
    if (ctx.method !== 'find') {
      throw new MethodNotAllowed()
    }

    const maxDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000 // 48 hours ago

    const query = {
      created_at: { $gte: new Date(maxDaysAgo) },
    }

    const ops = [
      {
        $group: {
          _id: {
            $dateToString: {
              date: '$created_at',
              format: '%Y-%m-%dT%H:00:00',
            },
          },
          date: { $first: '$created_at' },
          requests: { $sum: 1 },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]

    const results = await app.database.aggregate(
      collectionName,
      query,
      { sort: { created_at: 1 } },
      ops
    )
    ctx.result = results

    return ctx
  })

  app.use(getPath(), service)
}

const logStart: HookFn = async (ctx) => {
  ctx.locals['reqstart'] = Date.now()
  return ctx
}

const logEnd: HookFn = async (ctx, _, app) => {
  const service = app.service(getPath()) as CollectionService
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
