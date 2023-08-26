import { Definition, DefinitionType } from './schema'

interface Cursor<T = any> {
  exec(): Promise<T>
  limit(n: number): Cursor<T>
  populate(
    fields: (string | { collection: string; field: string })[]
  ): Cursor<T>
  select(fields: string[]): Cursor<T>
  skip(n: number): Cursor<T>
  sort(config: Record<string, -1 | 1>): Cursor<T>
}

type Data = Record<string, any>

interface Index {
  fields: string[]
  options: {
    unique?: boolean
  }
}

interface RenameField {
  type: 'rename-field'
  from: string
  to: string
}

interface RemoveField {
  type: 'remove-field'
  field: string
}

interface AddField {
  type: 'add-field'
  name: string
  definition: Definition
}

interface RenameCollection {
  type: 'rename-collection'
  to: string
}

// When adding support for RDBMS, we need to add `CreateCollection`, `DropCollection`, etc.
type MigrationStep = RenameField | RemoveField | AddField | RenameCollection

interface Migration {
  version: number
  steps: MigrationStep[]
}

interface Database {
  /**
   * Casting is an affordance to convert data in to formats that database prefers.
   * This is normally called during schema validation.
   */
  cast(value: any, type: DefinitionType): any
  count(collection: string, query: Record<string, any>): Promise<number>
  find<T = any>(collection: string, query: Record<string, any>): Cursor<T[]>
  /**
   * @param data data or array of data to be inserted
   */
  create<T = any>(collection: string, data: Data | Data[]): Cursor<T | T[]>
  patch<T = any>(
    collection: string,
    id: string | string[],
    data: Record<string, any>
  ): Cursor<T | T[]>
  remove(collection: string, id: string | string[]): Promise<void>
  migrate(collection: string, migration: Migration): Promise<void>
  /**
   * This method removes and adds the indexes as necessary
   */
  syncIndex(collection: string, indexes: Index[]): Promise<void>
}

export type { Cursor, Database, Index, Migration, MigrationStep }
