# Paths and Queries

This document describes how paths and query parameters are treated in Mangobase.

## Paths

When you add a collection with name `tasks` (from the dashboard), a service is registered to handle requests to `/tasks` and `/tasks/:id` paths.

See [context methods](/guide/context#methods) for the different methods (HTTP method + paths) that can be used to interact with the service.

## Queries

Queries are standardized to match the fields of a collection's schema. Therefore, if you have a schema for `users` collection with the following structure:

```json
{
  "name": { "type": "string" },
  "age": { "type": "number" },
  "address": {
    "type": "object",
    "schema": {
      "city": { "type": "string" },
      "houseNumber": { "type": "string" },
      "state": { "type": "string" }
    }
  }
}
```

We can perform the following filter

``` javascript
'/users?name=Not+Gr' // gets all users with name == 'Not Gr'
'/users?age[$gt]=17&address.city=Accra' // get all users above 17 years of age and live Accra
```

You may notice that there's a [pattern](/guide/rest) between the query parameters and the fields of the schema

### Query operators

As you may have already noticed from the example above, there is an operator `$gt` used. These are special operators that allow us
to perform advanced queries beside simple equality check.

:::info
These query operators are converted to the right filter and query by the database adapters.
:::

Lets talk about them:

#### $gt/gte

`/users?age[$gt]=17` - gets all users above 17 years of age

`/users?age[$gte]=17` - gets all users above or equal to 17 years of age

This query operator works for fields of number and date types.

#### $lt/lte

`/users?age[$lt]=17` - gets all users below 17 years of age

`/users?age[$lte]=17` - gets all users below or equal to 17 years of age

:::tip
If you wanted to get all users between 17 and 20 years of age, you can combine the two operators like so:

`/users?age[$gt]=17&age[$lt]=20`
:::
