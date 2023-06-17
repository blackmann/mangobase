import express from 'express'
import type { App } from 'mangobase'
import { context, methodFromHttp } from 'mangobase'

function expressServer(mangobaseApp: App) {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.all(['/api', '/api/*'], (req, res) => {
    // todo: handle options
    const ctx = context({
      data: req.body,
      headers: {},
      method: methodFromHttp(req.method),
      path: req.path.replace(/^\/api\/?/, ''),
      query: req.query,
    })

    mangobaseApp.api(ctx).then((context) => {
      res.status(context.statusCode || 200).json(context.result)
    })
  })

  app.get('*', (req, res) => {
    const [path, queryParams] = req.url.replace(/^\/_/, '').split('?')

    mangobaseApp.admin(path || 'index.html', queryParams).then((file) => {
      res.sendFile(file)
    })
  })

  return app
}

export default expressServer
