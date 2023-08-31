import Schema, { SchemaDefinitions } from '../schema'
import type App from '../app'
import Collection from '../collection'

function getCollection(app: App, name: string, schema: SchemaDefinitions) {
  return new Collection(name, {
    db: app.database,
    schema: Promise.resolve(new Schema(schema, { parser: app.database.cast })),
  })
}

export default getCollection
