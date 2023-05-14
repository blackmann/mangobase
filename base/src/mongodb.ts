import { Cursor, Database } from './database'
import { DefinitionType } from './schema'

class MongoCursor implements Cursor {
  exec(): Promise<any> {
    throw new Error('Method not implemented.')
  }
  limit(n: number): Cursor {
    throw new Error('Method not implemented.')
  }
  skip(n: number): Cursor {
    throw new Error('Method not implemented.')
  }
}

class MongoDB implements Database {
  cast(value: any, type: DefinitionType) {
    throw new Error('Method not implemented.')
  }
  find(collection: string, query: any): Cursor {
    throw new Error('Method not implemented.')
  }
  create(collection: string, data: any): Cursor {
    throw new Error('Method not implemented.')
  }
  patch(collection: string, id: string, data: any): Cursor {
    throw new Error('Method not implemented.')
  }
  remove(collection: string, id: string[]): Cursor {
    throw new Error('Method not implemented.')
  }
}
