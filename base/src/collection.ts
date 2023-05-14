import { Database } from './database'

interface Options {
  db: Database
}

class Collection {
  name: string
  db: Database

  constructor(name: string, options: Options) {
    this.name = name
    this.db = options.db
  }

  find() {
    //
  }
}

export default Collection
