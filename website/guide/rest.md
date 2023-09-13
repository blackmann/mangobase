# REST

Understanding [REST](https://en.wikipedia.org/wiki/REST) makes building backends a breeze. It introduces a pattern which allows to write a service that works on a lot of resources. This saves a lot of time building backend projects.

Another benefit that comes with building RESTful backends is that, it improves the developer experience of frontend engineers. It allows frontend engineers to make assumptions about the backend API.

## Demo

Let's make up a quick requirement:

    We're building a music app. It allows browsing of `albums` and `songs`.
    Every song belong to an album.

    1. We should be able to get all albums or filter through them
    2. We should be able to get all songs or filter through them
    3. We should be able to get all songs under album
    4. We should be able to get the album detail of a song

Our resources/models with look like this

```typescript
type Id = string

// albums collection
interface Album {
  id: Id
  title: string
  artist: Id
  description: string
  createdAt: Date
}

// songs collection
interface Song {
  id: Id
  album: Id
  artist: Id
  ft: Id[]
  title: string
  albumArt: string
  createdAt: Date
}
```

To appreciate REST, let's develop a non-RESTful API that a lot of us may be familiar with first.

| Feature                                   |                                                                            |
|-------------------------------------------|----------------------------------------------------------------------------|
| Get all albums                            | GET `/api/albums`                                                          |
| Get an album detail                       | GET `/api/albums/:album-id`                                                |
| Get all albums for an artist              | GET `/api/artist/:artist-id/albums`<sup>1</sup>                            |
| Create an album                           | POST `/api/albums`                                                         |
| Get all songs                             | GET `/api/songs`                                                           |
| Get a song detail                         | GET `/api/songs/:id`                                                       |
| Get songs for an album                    | GET `/api/albums/:album-id/songs`<sup>2</sup>                              |
| Get songs for an artist                   | GET `/api/artist/:artist-id/songs`<sup>3</sup>                             |
| Get songs for an artist in an album       | GET `/api/artist/:artist-id/albums/:album-id/songs`<sup>4</sup>            |

Here are some concerns:

1. How will we filter/query all albums for more than one artist?
1. How do we filter for songs in more than one album?
1. How do we filter for songs for more than one artist? Also in implementation, wouldn't we be doing same thing twice?: With the difference being `artist` and `album`.
1. Why not `/api/albums/:album-id/artist/:artist-id/songs`? Here, the user of the API cannot guess the order. They have to alway reach out to backend team.
1. Another somewhat unrelated concern is that we introduce an `artist` path into the API. But lets say the artist table doesn't belong to this app. We end up misleading users of the API into thinking they can do `/api/artists` (to get all artists) or `/api/artists/:id` (to get one artist).

This style of developing APIs requires a lot of effort to implement (each endpoint for each resource) and introduces inconsistencies that demands a lot of back-and-forth between the frontend person/team and the backend person/team.

## RESTful approach

A simple rule for REST API is that, each resource live on a `/api/<resource-name>/:id?` path and that's all to it.

> `/api` is optional

For example, the `Album` resource can only be accessed/interacted with `/albums` or `/albums/:id`. To perform additional filtering, we use query parameters.

Let's look at the previous table in a RESTful approach:

| Feature                                   |                                                                            |
|-------------------------------------------|----------------------------------------------------------------------------|
| Get all albums                            | GET `/api/albums`                                                          |
| Get an album detail                       | GET `/api/albums/:album-id`                                                |
| Get all albums for an artist              | GET `/api/albums/?artist=:artist-id`                                       |
| Create an album                           | POST `/api/albums`                                                         |
| Get all songs                             | GET `/api/songs`                                                           |
| Get a song detail                         | GET `/api/songs/:song-id`                                                  |
| Get songs for an album                    | GET `/api/songs/?album=:album-id`                                          |
| Get songs for an artist                   | GET `/api/songs?artist=:artist-id`                                         |
| Get songs for an artist in an album       | GET `/api/songs?artist=:artist-id&album=:album-id`                         |

1. If we wanted to filter albums for more that one artist, we could do `/api/albums?artist[]=artist-1&artist[]=artist-2`
1. We can perform filtering by title: `/api/albums?title=LSD`
1. We can perform fitering by title and artist: `/api/albums?artist=1&title=LSD`. The former design we had may be like: `/api/artist/1/albums?title=LSD`. The question it raises is that: why is that artist part in the path and the title in the query parameter. 🚩 Inconsistent!

## Naming conventions

In a RESTful design, the name of query parameters match the fields of the resource model. For example, it's safe to assume you can filter the songs with `albumArt` or `createdAt`. No need to second-guess that it could be `created_at` or `created` or `createdat`.

You can see how this eliminates a lot of confusion about how to query the API and even implement them.