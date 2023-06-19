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
    const { data } = await this.req.get('collections')
    return data.map((it: CollectionProps) => new Collection(this, it))
  }

  async addCollection(collection: any) {
    const { data } = await this.req.post('collections', collection)
    return new Collection(this, data)
  }
}

export default App
