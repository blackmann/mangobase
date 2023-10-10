import type { App } from 'mangobase'
import { context, methodFromHttp } from 'mangobase'
import qs from 'qs'

const API_PATH_REGEX = /^\/api(?:\/.*)?$/
const ADMIN_PATH_REGEX = /^\/_(?:\/.*)?$/

function bunServer(port = 5000) {
  return (app: App) =>
    Bun.serve({
      async fetch(req, server) {
        const url = new URL(req.url)

        if (API_PATH_REGEX.test(url.pathname)) {
          const ctx = context({
            // [ ] Handle bad json parse
            data: req.body ? await req.json() : null,
            headers: req.headers.toJSON(),
            method: methodFromHttp(req.method),
            path: url.pathname.replace(/^\/api\/?/, ''),
            query: qs.parse(url.search.replace(/^\?/, '')),
            url: req.url,
          })

          const res = await app.api(ctx)
          return new Response(JSON.stringify(res.result), {
            headers: { 'Content-Type': 'application/json' },
            status: res.statusCode,
          })
        }

        if (ADMIN_PATH_REGEX.test(url.pathname)) {
          const [path, queryParams] = url.pathname
            .replace(/^\/_/, '')
            .split('?')
          const file = await app.admin(path || 'index.html')
          return new Response(Bun.file(file))
        }

        return new Response(JSON.stringify({ detail: 'Not route found' }), {
          status: 404,
        })
      },
      port,
    })
}

export { bunServer }
