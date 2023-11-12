import { Schema, type SchemaDefinitions } from '../schema.js'
import { type App } from '../app.js'
import { Collection } from '../collection.js'

function getCollection(app: App, name: string, schema: SchemaDefinitions) {
  return new Collection(name, {
    db: app.database,
    schema: Promise.resolve(new Schema(schema, { parser: app.database.cast })),
  })
}

export default getCollection
