# Introduction

::: warning
Mango is still under heavy development; it's not advisable to use this for a production app as the API/design may change rapidly. You can however try it on side projects and proof-of-concepts.
:::

Mango (short for Mangobase) is a Javascript low-code backend framework for building [RESTful](rest.md) applications. Given that REST apps follow a convention on how to treat data, Mango provides the following benefits:

- Reduces boilerplate for creating services for data models
- Performs schema validation
- Handles errors
- Provides convenient querying mechanisms

When building REST backends, it's ubiquitous that you implement all of these features and some. Mango takes care of all of those.

::: tip
Being a low-code framework, you get to write code too, though a lot of things have been taken care of for you.
:::

## How it works

A Mangobase app works by accepting a [`context`](/guide/context) from a server (like express, bun, etc.), processing it and returning a `context` back.

To demonstrate with code, this is how it looks like:

:::warning
Just so it's not misleading, you wouldn't write any of the code demonstrated below. It's only an illustration (with code) about how it works.
:::

```javascript{5,12,15}
const mangobaseApp = new App({})
const app = express()

app.get(['/songs', '/songs/:id'], async (req, res) => {
  // create context
  const context = {
    path: req.path,
    headers: req.headers,
    // ... other properties here
  }

  // pass context to Mangobase and get result and statusCode back
  const { result, statusCode} = await app.api(context)

  // send response with express
  res.status(statusCode).json(result)
})
```

But with Mangobase, you don't have to do any of those. That was just a demonstration of the process looks like.

If it wasn't clear, Mangobase only processes a context and does not deal with how an http request comes in or how a response is sent.
This allows Mangobase to be able to work with any server (express, bun, nestjs, etc. etc.)

### Mangobase Project

A Mangobase projects combines a database adapter and a server adapter to handle RESTful requests. You can bootstrap a Mangobase project using the [CLI](/guide/getting-started). The code generated by the CLI may be all you may ever need.

You will spend the rest of your time in the dashboard (which runs in the browser) preparing your resource schema and setting up hooks.

### Dashboard

Mangobase ships with a dashboard to allow you view your data, create collections, configure hooks and more. See [dashboard](/guide/dashboard).
