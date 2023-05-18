import Method from './method'

interface Context {
  data?: any
  headers: Record<string, string | string[]>
  id?: string
  method: `${Method}`
  query: Record<string, any>
  result?: any
}

export default Context
