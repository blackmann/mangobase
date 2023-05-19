import Method from './method'

interface Context {
  data?: any
  headers: Record<string, string | string[]>
  method: `${Method}`
  path: string
  /** Params are values parsed from the URL path */
  params?: Record<string, any>
  /** Query are request query parameters */
  query: Record<string, any>
  result?: any
  statusCode?: number
}

export default Context
