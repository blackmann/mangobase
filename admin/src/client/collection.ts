import type App from './app'

interface CollectionProps {
  name: string
}

class Collection {
  app: App
  name: string

  constructor(app: App, data: CollectionProps) {
    this.app = app

    this.name = data.name
  }

  async find() {
    return []
  }
}

export default Collection
export type { CollectionProps }
