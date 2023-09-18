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

## Methods

In Mangobase, the following methods are used. It exists in the context as `ctx.method`.

### create

The equivalent HTTP method is `POST`. It is used to create a new resource. When you make a `POST` request to `/songs` for example, this is a `create` request.

Using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), this will look like:

```javascript{7}
// The API endpoint is [conventionally] prefixed with `/api`
const data = {
  title: 'Hello',
  artist: 'Adele',
}

fetch('/api/songs', {
  method: 'POST',
  body: JSON.stringify(data),
})
```

A successful call to `create` will return a `201` status code with the created resource in the response body.

### find

The equivalent HTTP method is `GET`. It is used to retrieve a list of resources. A `GET` request to `/songs` for example is a `find` request. This method is intended to always return a paginated response in the following format:

```typescript
interface PaginatedResponse {
  data: any[]
  total: number
  limit: number
  skip: number
}
```

In frontend code, this will look like:

```javascript
fetch('/api/songs', {
  method: 'GET',
})
```

The response will look like:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Hello",
      "artist": "Adele"
    },
    {
      "id": 2,
      "title": "Someone Like You",
      "artist": "Adele"
    }
  ],
  "total": 2,
  "limit": 10,
  "skip": 0
}
```

If you wanted to limit the number of items returned, you can pass a `limit` query parameter. For example, `/songs?$limit=1` will return only one item.

Pagination is done using the `skip` query parameter. For example, `/songs?$skip=5` will skip the first 5 items.

:::info
You may notice a `$` prefix on the query parameter. This is to prevent conflicts with the fields of a collection. For example, if you have a `limit` field on your collection, you can make a request to `/<collection>?limit=100km&$limit=3` _find_ items with a limit of 100km but only return 3 items.
:::

### get

Making a `GET` request to `/songs/1` for example is `get`. This method is intended to always return a single item.

In frontend code, this will look like:

```javascript
fetch('/api/songs/1', {
  method: 'GET',
})
```

A status code of `404` will be returned if the item is not found.

### update

The equivalent HTTP method is `PATCH`. It is used to update a single resource. For example, when you make a `PATCH` request to `/songs/1`.

### remove

The equivalent HTTP method is `DELETE`. A `DELETE` request to `/songs/1` for example, this is a `remove` request. Note that this requires the `id` of the resource to be passed as a parameter.

:::tip
All these methods can accept a query parameter. For example, with `find`, you can make a GET `/songs?title=hello` request to search for songs with the title `hello`.
:::

## Invalid requests

As far as Mangobase is concerned, some requests like the following are not supported:

- POST `/songs/1` - You cannot create an item on a detail path.
- PATCH `/songs` - You cannot patch a base path.
- DELETE `/songs` - You cannot delete a base path.
- PUT - Mangobase does not support `PUT` requests.
