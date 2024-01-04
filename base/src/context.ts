import { type Method } from './method.js'

interface Context {
  data?: any
  headers: Record<string, string | string[]>

  /**
   * Use this to store any abitrary data that can be accessed from another
   * hook.
   */
  locals: Record<string, any>
  method: `${Method}`

  /**
   * The path part of the URL without the query parameters. If you want the full URL,
   * see {@link Context.url}
   */
  path: string

  /** Params are values parsed from the URL path. For example, if a service handles the
   * path pattern `/songs/:songId`, you get params for a url `/songs/123` as
   *
   * ```javascript
   * {
   *    songId: '123'
   * }
   * ```
   */
  params?: Record<string, any>

  /** Query are request query parameters */
  query: Record<string, any>

  /**
   * Set this with the result of processing a context. When set, subsequent `before` hooks are not called.
   */
  result?: any

  /**
   * The status code the server adapter sets on the response.
   */
  statusCode?: number

  url: string

  /**
   * The authenticated user. This is normally set by an authentication hook.
   */
  user?: any
}

function context(ctx: Partial<Context>): Context {
  return {
    headers: {},
    locals: {},
    method: 'find',
    path: '',
    query: {},
    url: '/',
    ...ctx,
  }
}

export { context }
export type { Context }
