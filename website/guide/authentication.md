# Authentication

Mangobase comes with a basic built-in authentication [plugin](/guide/plugins). It provides a simple way to register and authenticate users.

To create a new user, you make a `POST` (aka `create`) request to the `/api/users` endpoint with body:

```json
{
  "email": "carlson@gmail.com",
  "username": "carlson",
  "password": "gocarl"
}
```

You can then login by making a `POST` request to `/api/login` with body:

```json
{
  "username": "carlson",
  // or "email": "carlson@gmail",
  "password": "gocarl"
}
```

You get a response in the format:

```json
{
  "user": {
    "id": "5f1e5a8b9d6b2b0017b4e6b1",
    "username": "carlson",
    "email": "carlson@gmail.com",
  },
  "auth": {
    "type": "Bearer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

When making authenticated requests using the built-in method, you add an `Authorization` header with the value `${auth.type} ${auth.token}`.

## Custom authentication

You can choose to implement your own authentication process, like using an auth library or service. To do this, you can create a [plugin](/guide/plugins). See this [implementation](https://github.com/blackmann/mangobase/blob/de9281da1e840ed28acbf715f8417f29b3da56dc/base/src/authentication.ts#L115) as a reference.
