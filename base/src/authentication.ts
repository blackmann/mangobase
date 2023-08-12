import { BadRequest, MethodNotAllowed } from './errors'
import { CollectionHooks, HOOKS_STUB } from './manifest'
import App from './app'
import CollectionService from './collection-service'
import { Hook } from './hook'
import { SchemaDefinitions } from './schema'
import bcrypt from 'bcryptjs'
import { context } from './context'

const ROUNDS = process.env.NODE_ENV !== 'production' ? 8 : 16

const schema: SchemaDefinitions = {
  password: { required: true, type: 'string' },
  user: { required: true, type: 'id' },
}

const RequirePassword: Hook = {
  description: 'Require password field. [Base auth]',
  id: 'auth-require-password',
  name: 'Require Password',
  run: async (ctx) => {
    if (typeof ctx.data?.['password'] !== 'string') {
      throw new BadRequest('`password` field is required or should be a string')
    }

    return ctx
  },
}

const CreatePasswordAuthCredential: Hook = {
  description: 'Creates the auth credentials for created user. [Base auth]',
  id: 'create-auth-credential',
  name: 'Create Password Auth Credential',
  run: async (ctx, _, app) => {
    const password = ctx.data?.['password']
    if (typeof password !== 'string') {
      throw new BadRequest('`password` field is missing')
    }

    const { collection: usersCollection } = app.service(
      'users'
    ) as CollectionService

    if (!ctx.result || !(await usersCollection.get(ctx.result._id))) {
      throw new BadRequest(
        'No user in result. Make sure this hook (create-auth-credential) is an after hook for users service.'
      )
    }

    const credentialsPipeline = app.pipeline(App.unexposed('auth-credentials'))!

    const hashedPassword = await bcrypt.hash(password, ROUNDS)

    // we're using the pipeline so that if any hooks are attached to the auth credentials
    // service, they get executed
    const res = await credentialsPipeline.run(
      context({
        data: {
          password: hashedPassword,
          user: ctx.result._id,
        },
        method: 'create',
      })
    )

    if (res.statusCode !== 201) {
      throw new BadRequest(
        'Failed to create auth credentials. User account may be created already.',
        res.result
      )
    }

    return ctx
  },
}

/** This is the primary authentication mechanism */
async function baseAuthentication(app: App) {
  const name = 'auth-credentials'
  if (!(await app.manifest.collection(name))) {
    await app.manifest.collection(name, { name, schema })
  }

  app.hooksRegistry.register(RequirePassword, CreatePasswordAuthCredential)
  app.use('auth-credentials', new CollectionService(app, name))

  let usersHooks: CollectionHooks

  {
    if (!(await app.manifest.getHooks('users'))) {
      await app.manifest.setHooks('users', HOOKS_STUB)
    }

    usersHooks = await app.manifest.getHooks('users')
  }

  if (
    !usersHooks['before']['create'].find(
      ([hookId]) => hookId === RequirePassword.id
    )
  ) {
    // [ ] Reconcile hooks editor to show this hook
    usersHooks.before.create.push([RequirePassword.id])
  }

  app.use('login', async (ctx) => {
    if (ctx.method !== 'create') {
      throw new MethodNotAllowed()
    }
    return ctx
  })
}

async function anonymousAuthentication(app: App) {
  // just a stub
}

export { RequirePassword, anonymousAuthentication, baseAuthentication }
