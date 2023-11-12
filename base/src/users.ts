import App from './app.js'
import { SchemaDefinitions } from './schema.js'

const usersSchema: SchemaDefinitions = {
  avatar: { type: 'string' },
  email: { required: true, type: 'string', unique: true },
  fullname: { required: true, type: 'string' },
  // basic, dev
  // [ ] Prevent anyone from just creating a 'dev' account. Use hook
  role: { defaultValue: 'basic', required: true, type: 'string' },
  username: { required: true, type: 'string', unique: true },
  verified: { type: 'boolean' },
}

// [ ] Make collection schema read-only
async function users(app: App) {
  if (!(await app.manifest.collection('users'))) {
    const indexes = [
      { fields: ['username'], options: { unique: true } },
      { fields: ['email'], options: { unique: true } },
    ]

    await app.manifest.collection('users', {
      exposed: true,
      indexes,
      name: 'users',
      readOnlySchema: true,
      schema: usersSchema,
    })

    await app.database.addIndexes('users', indexes)
  }
}

export default users
