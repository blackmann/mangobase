# Getting started

Mangobase is fundamentally designed to be easy to use while providing a cohesion of developer experience; that said, it's easy to get started.

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
