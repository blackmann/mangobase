import type App from './app'

type Schema = Record<string, any>

interface CollectionProps {
  name: string
  schema: Schema
}

class Collection {
  app: App
  name: string
  schema: Schema

  constructor(app: App, data: CollectionProps) {
    this.app = app

    this.name = data.name
    this.schema = data.schema
  }

  async find() {
    const { data } = await this.app.req.get(`/${this.name}`)
    return data
  }
}

export default Collection
export type { CollectionProps }
