import { DefinitionType } from './schema'

interface Database {
  /**
   * Casting is an affordance to convert data in to formats that database prefers.
   * This is normally called during schema validation.
   */
  cast(value: any, type: DefinitionType): any
  find(collection: string, query: any): Promise<any>
  /**
   * @param data data or array of data to be inserted
   */
  create(collection: string, data: any): Promise<any>
  update(collection: string, id: string, data: any): Promise<any>
  delete(collection: string, id: string[]): Promise<void>
}

export type { Database }
