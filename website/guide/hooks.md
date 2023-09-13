# Hooks

Hooks are simply funtions that are run before and after a context hits the related service.

Let's say we only allow admins to create users in our app and also send email to the user after the created. We could have a chain of hooks in the following format

```

authenticateUser -> checkUserIsAdmin -> [ user-service:create ] -> sendEmail

```

1. `authenticateUser` can be implemented to decode the `Authorization` entry from the [headers](/api/base/Context#headers). After decoding, the hook can assign it to [`context.user`](/api/base/Context#user).
1. `checkUserIsAdmin` checks that `user.role === 'admin'`, else it throws an [Unathorized](/api/base/App#errors) error
1. The service goes ahead and creates the user
1. The context is then passed to `sendEmail`; here a SendGrid API can be called to send a welcome email.

The signature for any hook is in the format:

```typescript
async function hookName(context: Context, app: App) {
  // Do something, with `context` maybe

  return context
}
```

What this means is that, hooks are reusable by default. You can reuse a hook for many services.

## How to use hooks

Generally, you'll use the UI to compose your hooks. Mangobase ships with a number of relevant hooks you can use with your collections without having to write any by hand (in code).

Here's a video on how to use the UI/Dashboard to compose hooks.

-[X] Create video [YT]

The hooks demonstrated in the video are known as `plugin` hooks. They are installed on [`app.hooksRegistry`](/api/base/App#hooksregistry) and become available for use in the hooks editor of each collection.

### Registering a plugin hook

To register a plugin hook so that it becomes available in the hooks editor, you can follow this example:

```typescript
// First define the hook
const AllowAdminsOnly: Hook {
  id: 'allow-admins',
  name: 'Allow Admins',
  run: async (ctx, config, app) {
    if (!ctx.user) {
      throw new app.errors.BadRequest('user is required')
    }

    if (ctx.user.role !== 'admin') {
      throw new app.errors.Unauthorized()
    }

    return ctx
  }
}

// then register it on the hook registry
app.hooksRegistry.register(AllowAdminsOnly)
```

:::info
You can see more varied examples from here: https://github.com/blackmann/mangobase/blob/master/base/src/hooks.ts
:::

### App level hooks

Here's an implementation for `authenticateUser` as an example. This hook will be registered on the app. This means, the hook will be called for every request (regardless of the service).

```typescript
async function authenticateUser(context: Context, app: App) {
  const { authorization } = context.headers
  const jwtUser = decodeAuthorizationJwt(authorization)

  const usersCollection = await app.manifest.collection('users)
  const user = await usersCollection.find(jwtUser.id)

  context.user = user
}
```

Here's how you register it with the app:

```typescript
import { authenticateUser } from './authenticate'

const app = new App({})

app.before(authenticate)
```

There's also a corresponding `after` method, to register after hooks. You can register as many hooks as you want.

### Service level hooks

Let's implement `sendEmail` as a demonstration:

```typescript
async function sendEmail(context: Context, app: App) {
  // since we expect this hook to be in the `after` stage
  // we can throw an error to expect `result` on the context

  if (!context.result) {
    throw new app.errors.ServiceError(
      'missing `result` on the context. make sure this hook is registered as an after-hook.'
    )
  }

  const user = context.result as User
  await sendWelcomeEmail({ email: user.email })

  return context
}
```

```typescript
import { sendEmail } from './send-email'

const app = new App({})

// assuming we already registered a user service pipeline
const usersPipeline = app.pipeline('users')
usersPipeline.after(sendEmail)
```

:::tip
See API docs for what [Pipeline](/api/base/Pipeline) is.
:::

### Error hooks

When an error is thrown in a pipeline, all subsequent before or after hooks for the service and the app are not called. The current context is then passed to all error hooks registered on the app. Error hooks can only be installed on the app

```typescript
const app = new App({ })

app.error(async (ctx, app) => {
  // report error to sentry, maybe
})
```