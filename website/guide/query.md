# Query

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

## Query operators

As you may have already noticed from the example above, there is an operator `$gt` used. These are special operators that allow us
to perform advanced queries beside simple equality check.

:::info
These query operators are converted to the right filter and query by the database adapters.
:::

Lets talk about them:

### $gt/gte
