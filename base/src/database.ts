import { DefinitionType } from './schema'

interface Cursor<T = any> {
  exec(): Promise<T>
  limit(n: number): Cursor<T>
  populate(fields: string[]): Cursor<T>
  select(fields: string[]): Cursor<T>
  skip(n: number): Cursor<T>
  sort(config: Record<string, -1 | 1>): Cursor<T>
}

type Data = Record<string, any>

interface Database {
  /**
   * Casting is an affordance to convert data in to formats that database prefers.
   * This is normally called during schema validation.
   */
  cast(value: any, type: DefinitionType): any
  count(collection: string, query: Record<string, any>): Cursor<number>
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
  remove(collection: string, id: string[]): Cursor<void>
}

export type { Cursor, Database }
