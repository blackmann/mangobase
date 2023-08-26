import App from './app'
import CollectionService from './collection-service'
import { SchemaDefinitions } from './schema'

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

// [ ] Validate users schema to make sure it's not corrupted
// [ ] Run migration on changes
async function users(app: App) {
  if (!(await app.manifest.collection('users'))) {
    await app.manifest.collection('users', {
      exposed: true,
      indexes: [
        { fields: ['username'], options: { unique: true } },
        { fields: ['email'], options: { unique: true } },
      ],
      name: 'users',
      schema: usersSchema,
    })

    // [ ] Ensure indices
  }

  app.use('users', new CollectionService(app, 'users'))
}

export default users
