import { DefinitionType } from './schema'

interface Cursor {
  exec(): Promise<any>
  limit(n: number): Cursor
  populate(fields: string[]): Cursor
  select(fields: string[]): Cursor
  skip(n: number): Cursor
  sort(config: Record<string, -1 | 1>): Cursor
}

interface Database {
  /**
   * Casting is an affordance to convert data in to formats that database prefers.
   * This is normally called during schema validation.
   */
  cast(value: any, type: DefinitionType): any
  count(collection: string, query: Record<string, any>): Cursor
  find(collection: string, query: Record<string, any>): Cursor
  /**
   * @param data data or array of data to be inserted
   */
  create(collection: string, data: Record<string, any>): Cursor
  patch(
    collection: string,
    id: string | string[],
    data: Record<string, any>
  ): Cursor
  remove(collection: string, id: string[]): Cursor
}

export type { Cursor, Database }
