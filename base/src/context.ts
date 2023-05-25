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
  result?: any
  statusCode?: number
}

function context(ctx: Partial<Context>): Context {
  return {
    headers: {},
    locals: {},
    method: 'find',
    path: '',
    query: {},
    ...ctx,
  }
}

export { context }
export type { Context }
