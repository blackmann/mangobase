# FAQs

## Who is this for?

- Beginners who want to ease into backend development.
- Fronted [focused] developers who want to build a backend for their app.
- Fullstack developers who want to quickly bootstrap a backend for their app without having to write boilerplate code.

Though Mangobase is low-code and easy to use, it is also very flexible and can be used to build complex applications.

## How do I make requests to my API?

You can use any HTTP client to make requests to your API. For example, you can use [HTTPie](https://httpie.io) or [Postman](https://www.postman.com).

Inside your frontend app, you can use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) or [Axios](https://axios-http.com), etc.

If you added a collection with name `songs` for example, you can make a `GET` request to `http://localhost:3000/api/songs` to get all songs. You can also make a `POST` request to `http://localhost:3000/api/songs` to create a new song.

Other ways to interact with your API can be found in [Context methods](/guide/context#methods).
