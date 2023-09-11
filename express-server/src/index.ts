import express from 'express'
import type { App } from 'mangobase'
import { context, methodFromHttp } from 'mangobase'
import cors from 'cors'

/**
 * No-op server adapter for express
 */
function expressServer(mangobaseApp: App): express.Express {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  return withExpress(app, mangobaseApp)
}

/**
 * Use this function if you have a custom express instance. Remember to set `cors`, `json` and `urlencoded`.
 * These are critical to how to how mangobase works.
 *
 * @example
 * ```
 * import cors from 'cors'
 *
 * const app = express()
 * app.use(cors())
 * app.use(express.json())
 * app.use(express.urlencoded({ extended: true }))
 * ```
 */
function withExpress(app: express.Express, mangobaseApp: App): express.Express {
  app.all(['/api', '/api/*'], (req, res) => {
    // [ ]: handle OPTIONS
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

    mangobaseApp.admin(path || 'index.html').then((file) => {
      res.sendFile(file)
    })
  })

  return app
}

export { expressServer, withExpress }
