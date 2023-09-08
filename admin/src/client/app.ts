import Collection, { type CollectionProps } from './collection'
import axios, { RequestHeaders } from 'redaxios'

type Req = typeof axios
interface Auth {
  auth: { token: string; type: 'Bearer' }
  user: {
    fullname: string
    username: string
  }
}

class App {
  host: string
  req: Req
  auth?: Auth

  constructor(host: string) {
    this.host = host
    this.auth = this.get('auth')
    this.req = this.getRequests()
  }

  private getRequests() {
    const headers: RequestHeaders = {}

    if (this.auth) {
      headers[
        'authorization'
      ] = `${this.auth.auth.type} ${this.auth.auth.token}`
    }

    return axios.create({ baseURL: this.host, headers })
  }

  async collections(): Promise<Collection[]> {
    const { data } = await this.req.get('collections?$sort[name]=1')
    return data.map((it: CollectionProps) => new Collection(this, it))
  }

  async collection(name: string): Promise<Collection> {
    const { data } = await this.req.get(`collections/${name}`)
    return new Collection(this, data)
  }

  async addCollection(collection: any) {
    const { data } = await this.req.post('collections', collection)
    return new Collection(this, data)
  }

  async editCollection(name: string, collection: any) {
    const { data } = await this.req.patch(`collections/${name}`, collection)
    return new Collection(this, data)
  }

  async hookRegistry() {
    const { data } = await this.req.get('_dev/hooks-registry')
    return data
  }

  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))

    if (key === 'auth') {
      this.auth = value
      this.req = this.getRequests()
    }
  }

  get(key: string) {
    const value = localStorage.getItem(key)
    return value && JSON.parse(value)
  }

  remove(key: string) {
    localStorage.removeItem(key)
  }
}

export default App
