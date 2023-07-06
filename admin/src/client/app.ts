import axios from 'redaxios'
import Collection, { type CollectionProps } from './collection'

type Req = typeof axios



class App {
  host: string
  req: Req

  constructor(host: string) {
    this.host = host
    this.req = axios.create({ baseURL: host })
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

  async hookRegistry() {
    const { data } = await this.req.get('hooks-registry')
    return data
  }
}

export default App
