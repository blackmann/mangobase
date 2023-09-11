# Context

Context describes a single request to the app. After processing a request, the app returns a context containing a [`result`](/api/base/Context#result).

How _processing_ works is described as a pipeline. A pipeline first runs all `before` [hooks](/guide/hooks) installed on the app, followed by all `after` hooks installed for the service.

::: info
Subsequent `before` hooks stop executing the moment `context.result` is set to a non-null value, then skips the service and proceeds with all `after` hooks.
:::

See the structure of a context [here](/api/base/Context).

A context is normally created by the [server](/guide/server-adapters) and passed to the with [`app.api(ctx)`](/api/base/App#api)
