# Server adapters

You can use Mango with any server of choice. This is possible because the core tries to be agnostic of transport mechanisms or server implementations and uses [`contexts`](/guide/contexts) instead.

This way, servers can form a context, pass it to [`app.api()`](/api/base/App#api) and then get a context back. With this result, the server can use it to form a response per its design.

Mango, however, offers server implementations for Express and Bun. But you can be able to [implement a server](#other-servers) for any Javascript framework. _It's actually very easy._

## Express

For express servers, install [@mangobase/express](https://www.npmjs.com/package/@mangobase/express)

```bash
yarn add express @mangobase/express
```

Usage example:

```javascript{2,5}
import { App } from 'mangobase'
import expressServer from '@mangobase/express'

const app = new App({})
app.serve(expressServer).listen(4000)
```

### Existing projects

If you're adding Mangobase to an existing project, or need more control over the express app instance, you can do the following instead:

```javascript
import { App } from 'mangobase'
import express from 'express'
import { withExpress } from '@mangobase/express'

const app = new App({})
let expressApp = express()

// do stuff with `expressApp` as usual, like add middleware, etc.

expressApp = app.serve(withExpress(expressApp))

// do more stuff with `expressApp` ...

expressApp.listen(4000)
```

## Bun

Mango works with [bun](https://bun.sh) too.

::: warning
At the time of writing this, Mango works with bun, except that Bun has not implement the [KeyObject](https://github.com/oven-sh/bun/issues/2036) API yet. Making it impossible to do stuff around authentication/users.
:::

To use Mango with Bun, install [@mangobase/bun](https://www.npmjs.com/package/@mangobase/bun)

Usage example:

```typescript
import { App } from 'mangobase'
import bunServer from '@mangobase/bun'

const app = new App({ })

app.serve(bunServer(4000))
```

## Other servers

If you're using other frameworks other than `express` or `Bun`, you can still use Mango but you'll have to implement an adapter to create and handle contexts for Mangobase [`App`](/api/base/App).

This involves only a few lines of code. You can reference the implementation for express here: https://github.com/blackmann/mangobase/blob/master/express-server/src/index.ts
