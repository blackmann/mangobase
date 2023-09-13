# Getting started

Mangobase is fundamentally designed to be easy to use while providing a cohesion of developer experience; that said, it's easy to get started.

:::info
We currently provide a database adapter for Mongo only, so you may need to install [Mongo](https://mongodb.com) to be able to use Mango. You can however implement a custom database adapter for any database of choice. See [database adapters](/guide/database-adapters)
:::

## Starting a new project

You can use the command below to bootstrap a project

::: code-group

```sh [npm]
$ npm create mango@latest
```

```sh [yarn]
$ yarn create mango@latest
```

:::

## Adding to an existing project

You can add Mango to any existing project. At the moment, [@mangobase/express](/guide/server-adapters#express) and [@mangobase/bun](/guide/server-adapters#bun) are the officially supported server adapters. You can add Mango to your project in a few easy steps if you're using any of those frameworks.

Otherwise, you can implement a custom adapter for your project. See [implement a custom server adapter](/guide/server-adapters#other-servers)

:::tip
Reference the [examples](https://github.com/blackmann/mangobase/tree/master/examples) on how to set up your project.
:::

:::info
Mangobase depends on [jose](https://github.com/panva/jose) for handling JWT. You'll have to add that to your dependencies.
:::
