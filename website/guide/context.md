# Context

Context describes a single request to the app. After processing a request, the app returns a context containing a [`result`](/api/base/Context#result).

How _processing_ works is described as a pipeline. A pipeline runs in the following sequence:

1. Runs all `before` hooks [in sequence] installed on the app
1. Runs all `before` hooks [in sequence] installed on the service
1. Passes `context` to the service to handle.
1. The result from the service is passed [in sequence] to all `after` hooks installed on the service
1. Runs all `after` hooks [in sequence] installed on the app

The current state of the context is passed with every call to a hook in the pipeline or the service.

::: info
Subsequent `before` hooks stop executing the moment `context.result` is set to a non-null value, then skips the service and proceeds with all `after` hooks.
:::

See the structure of a context [here](/api/base/Context).

A context is normally created by the [server](/guide/server-adapters) and passed to the app with [`app.api(ctx)`](/api/base/App#api)
