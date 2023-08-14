import express from 'express'
import type { App } from 'mangobase'
import { context, methodFromHttp } from 'mangobase'
import cors from 'cors'

function expressServer(mangobaseApp: App) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.all(['/api', '/api/*'], (req, res) => {
    // todo: handle options
    const ctx = context({
      data: req.body,
      headers: req.headers as Record<string, string | string[]>,
      method: methodFromHttp(req.method),
      path: req.path.replace(/^\/api\/?/, ''),
      query: req.query,
      url: req.url,
    })

    mangobaseApp.api(ctx).then((context) => {
      res.status(context.statusCode || 200).json(context.result)
    })
  })

  app.get(['/_', '/_/*'], (req, res) => {
    const [path, queryParams] = req.url.replace(/^\/_/, '').split('?')

    mangobaseApp.admin(path || 'index.html', queryParams).then((file) => {
      res.sendFile(file)
    })
  })

  return app
}

export default expressServer
