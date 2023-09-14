import * as jose from 'jose'
import {
  BadRequest,
  MethodNotAllowed,
  ServiceError,
  Unauthorized,
} from './errors'
import { CollectionHooks, HOOKS_STUB } from './manifest'
import { Hook, HookFn } from './hook'
import App from './app'
import CollectionService from './collection-service'
import { SchemaDefinitions } from './schema'
import bcrypt from 'bcryptjs'
import { context } from './context'

const ROUNDS = process.env.NODE_ENV !== 'production' ? 8 : 16

const authCredentialsSchema: SchemaDefinitions = {
  password: { required: true, type: 'string' },
  user: { relation: 'users', required: true, type: 'id' },
}

const RequirePassword: Hook = {
  description: 'Require password field. [Base auth]',
  id: 'auth-require-password',
  name: 'Require Password',
  run: async (ctx) => {
    const password = ctx.data?.['password']
    if (typeof password !== 'string') {
      throw new BadRequest('`password` field is required or should be a string')
    }

    ctx.locals['password'] = password
    delete ctx.data!['password']

    return ctx
  },
}

const RequireAuth: Hook = {
  description: 'Allow only authenticated users',
  id: 'require-auth',
  name: 'Require Auth',
  run: async (ctx) => {
    if (!ctx.user) {
      throw new Unauthorized()
    }
    return ctx
  },
}

const AssignAuthUser: Hook = {
  description:
    'Assigns `user` field of data to the id of the authenticated user.',
  id: 'assign-auth-user',
  name: 'Assign Auth User',
  run: async (ctx) => {
    if (ctx.data) {
      ctx.data.user = ctx.user
    }

    return ctx
  },
}

const CreatePasswordAuthCredential: Hook = {
  description: 'Creates the auth credentials for created user. [Base auth]',
  id: 'create-auth-credential',
  name: 'Create Password Auth Credential',
  run: async (ctx, _, app) => {
    const password = ctx.locals['password']
    if (typeof password !== 'string') {
      throw new BadRequest('`password` field is missing')
    }

    const { collection: usersCollection } = app.service(
      'users'
    ) as CollectionService

    if (!ctx.result || !(await usersCollection.get(ctx.result._id))) {
      throw new BadRequest(
        `No user in result. Make sure this hook \`${CreatePasswordAuthCredential.id}\` is an after:create hook for users service.`
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
          user: ctx.result._id.toString(),
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
  const secretKey = new TextEncoder().encode(process.env.SECRET_KEY!)

  const name = 'auth-credentials'
  if (!(await app.manifest.collection(name))) {
    // [ ] Ensure this index
    await app.manifest.collection(name, {
      indexes: [{ fields: ['user'], options: { unique: true } }],
      name,
      schema: authCredentialsSchema,
    })
  }

  app.hooksRegistry.register(
    RequirePassword,
    CreatePasswordAuthCredential,
    RequireAuth,
    AssignAuthUser
  )

  await upsertHooks(app)

  app.use('login', async (ctx, app) => {
    checkSecretKeyEnv()

    if (ctx.method !== 'create') {
      throw new MethodNotAllowed()
    }

    if (!(ctx.data?.username && ctx.data?.password)) {
      throw new BadRequest('`username` and `password` required')
    }

    const usersService = app.service('users') as CollectionService
    const {
      data: [user],
    } = await usersService.collection.find({
      query: { username: ctx.data.username },
    })

    if (!user) {
      throw new BadRequest('Incorrect username/password combination')
    }

    const credentialService = app.service(
      App.unexposed(name)
    ) as CollectionService

    const {
      data: [credential],
    } = await credentialService.collection.find({
      query: { user: user._id.toString() },
    })

    if (
      !credential ||
      !(await bcrypt.compare(ctx.data.password, credential.password))
    ) {
      throw new BadRequest('Incorrect username/password combination.')
    }

    // [ ] Sign with distinction for dev access
    // [ ] Use `expiresIn` settings from dashboard
    const jwt = await new jose.SignJWT({ user: user._id })
      .setExpirationTime('7d')
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secretKey)

    ctx.result = {
      auth: { token: jwt, type: 'Bearer' },
      user,
    }

    return ctx
  })

  app.before(checkAuth())
  app.before(protectDevEndpoints)

  // [ ] Watch out for trailing slash? Should we standardize and remove/add trailing slashes?
  app.after(async (ctx) => {
    if (ctx.method === 'patch' && ctx.path === `${App.onDev('hooks')}/users`) {
      const usersHooks = await upsertHooks(app)
      ctx.result = usersHooks
    }

    return ctx
  })
}

async function upsertHooks(app: App) {
  let usersHooks: CollectionHooks
  let dirty = false
  {
    if (!(await app.manifest.getHooks('users'))) {
      await app.manifest.setHooks('users', HOOKS_STUB)
      dirty = true
    }

    usersHooks = await app.manifest.getHooks('users')
  }

  if (
    !usersHooks['before']['create'].find(
      ([hookId]) => hookId === RequirePassword.id
    )
  ) {
    usersHooks.before.create.push([RequirePassword.id])
    dirty = true
  }

  if (
    !usersHooks['after']['create'].find(
      ([hookId]) => hookId === CreatePasswordAuthCredential.id
    )
  ) {
    usersHooks.after.create.push([CreatePasswordAuthCredential.id])
    dirty = true
  }

  if (dirty) {
    const { data } = await app.pipeline(App.onDev('hooks'))!.run(
      context({
        data: usersHooks,
        method: 'patch',
        params: { id: 'users' },
      })
    )

    return data
  }

  return usersHooks
}

function checkAuth(): HookFn {
  const secretKey = new TextEncoder().encode(process.env.SECRET_KEY!)
  return async (ctx, _, app) => {
    checkSecretKeyEnv()

    const authHeader = ctx.headers['authorization']
    if (authHeader) {
      const [, token] = (authHeader as string).split(' ')
      try {
        const { payload } = await jose.jwtVerify(token, secretKey)
        const { user: userId } = payload

        const usersCollection = (app.service('users') as CollectionService)
          .collection
        const user = await usersCollection.get(userId as string)

        ctx.user = user
      } catch (err) {
        console.log(err)
        //
      }
    }

    return ctx
  }
}

const protectedPathsRegexs = [/^collections(?:\/.*)?$/, /^_dev\//]

const protectDevEndpoints: HookFn = async (ctx) => {
  if (ctx.path === '_dev/dev-setup' || ctx.user?.role === 'dev') {
    return ctx
  }

  if (!protectedPathsRegexs.some((reg) => reg.test(ctx.path))) {
    return ctx
  }

  throw new Unauthorized('Invalid auth')
}

function checkSecretKeyEnv() {
  if (!process.env.SECRET_KEY) {
    // [ ] Add link to docs on how to solve
    throw new ServiceError('Your environment is missing `SECRET_KEY` variable.')
  }
}

export { RequirePassword, baseAuthentication }
