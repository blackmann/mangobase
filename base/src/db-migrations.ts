import type App from './app.js'
import type { Migration } from './database.js'
import { type SchemaDefinitions } from './schema.js'
import getCollection from './lib/get-collection.js'

const migrationSchema: SchemaDefinitions = {
  id: { required: true, type: 'string' },
  version: { required: true, type: 'number' },
}

const collectionName = '_migrations'

async function dbMigrations(app: App) {
  if (!(await app.manifest.collection(collectionName))) {
    const indexes = [{ fields: ['version'], options: { unique: true } }]
    await app.manifest.collection(collectionName, {
      exposed: false,
      indexes,
      name: collectionName,
      schema: migrationSchema,
    })

    await app.database.addIndexes(collectionName, indexes)
  }

  const migrationsCollection = getCollection(
    app,
    collectionName,
    migrationSchema
  )

  const {
    data: [latestMigration],
  } = await migrationsCollection.find({
    filter: { $limit: 1, $sort: { created_at: -1 } },
    query: {},
  })

  let latestMigrationVersion = latestMigration?.version || 0
  const latestCommitVersion =
    (await app.manifest.getLastMigrationCommit())?.version || 0

  latestMigrationVersion++

  if (latestMigrationVersion <= latestCommitVersion) {
    console.log('applying migrations')
  }

  while (latestMigrationVersion <= latestCommitVersion) {
    const migration = await app.manifest.getMigration(latestMigrationVersion)
    await app.database.migrate(migration)

    await saveMigration(app, migration)

    console.log(`[ ] migration ${migration.id} applied`)
    latestMigrationVersion++
  }
}

async function saveMigration(app: App, migration: Migration) {
  const migrationsCollection = getCollection(
    app,
    collectionName,
    migrationSchema
  )

  await migrationsCollection.create({
    id: migration.id,
    version: migration.version,
  })
}

export default dbMigrations
export { saveMigration }
