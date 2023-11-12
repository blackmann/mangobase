import {
  BadRequest,
  MethodNotAllowed,
  ServiceError,
  Unauthorized,
} from './errors.js'
import { CollectionHooks, HOOKS_STUB } from './manifest.js'
import { Hook, HookFn } from './hook.js'
import { SignJWT, jwtVerify } from 'jose'
import { onDev, unexposed } from './lib/api-paths.js'
import type App from './app.js'
import CollectionService from './collection-service.js'
import { SchemaDefinitions } from './schema.js'
import bcrypt from 'bcryptjs'
import { context } from './context.js'

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
      ctx.data.user = ctx.user?._id.toString()
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

    const credentialsPipeline = app.pipeline(unexposed('auth-credentials'))!

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
  const name = 'auth-credentials'
  const secretKey = new TextEncoder().encode(process.env.SECRET_KEY!)

  if (!(await app.manifest.collection(name))) {
    const index = [{ fields: ['user'], options: { unique: true } }]
    await app.manifest.collection(name, {
      indexes: index,
      name,
      readOnlySchema: true,
      schema: authCredentialsSchema,
    })

    await app.database.addIndexes(name, index)
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

    if (!((ctx.data?.username || ctx.data?.email) && ctx.data?.password)) {
      throw new BadRequest('`username`/`email` and `password` required')
    }

    const usersService = app.service('users') as CollectionService
    const {
      data: [user],
    } = await usersService.collection.find({
      query: {
        // [ ] Support casting in $or queries
        $or: [{ username: ctx.data.username }, { email: ctx.data.email }],
      },
    })

    if (!user) {
      throw new BadRequest('Incorrect username/password combination')
    }

    const credentialService = app.service(unexposed(name)) as CollectionService

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
    const sign = new SignJWT({ user: user._id })
    const jwt: string = await sign
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
    if (ctx.method === 'patch' && ctx.path === `${onDev('hooks')}/users`) {
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
    const { data } = await app.pipeline(onDev('hooks'))!.run(
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
        interface JWTStructure {
          user: string
        }

        const {
          payload: { user: userId },
        } = await jwtVerify<JWTStructure>(token, secretKey)

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

const DEV_BASE = /^_dev\//
const UNEXPOSED_BASE = /^_x\//
const protectedPathsRegexs = [DEV_BASE, UNEXPOSED_BASE]

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
    throw new ServiceError('Your environment is missing `SECRET_KEY` variable.')
  }
}

export { RequirePassword, baseAuthentication }
