import Method from '../method.js'

const lookup: Record<string, Method> = {
  DELETE: Method.remove,
  GET: Method.find,
  PATCH: Method.patch,
  POST: Method.create,
}

function methodFromHttp(method: string) {
  return lookup[method] || Method.find
}

export default methodFromHttp
