import Method from './method'

interface Context {
  data?: any
  headers: Record<string, string | string[]>
  locals: Record<string, any>
  method: `${Method}`
  path: string
  /** Params are values parsed from the URL path */
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
  user?: any
}

function context(ctx: Partial<Context>): Context {
  return {
    headers: {},
    locals: {},
    method: 'find',
    path: '',
    query: {},
    url: ' ',
    ...ctx,
  }
}

export { context }
export type { Context }
