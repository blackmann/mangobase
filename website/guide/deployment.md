# Deployment

:::warning
It's not advisable to make changes to schemas, hooks, or other configuration in production. If you need to make changes, it's best to do so in a development environment and then deploy the changes to production.
:::

## Dokku

If you boostrapped the app with the CLI, you can deploy to your Dokku instance/app with the following command:

```bash
git push dokku master
```

:::info
Dokku is a self-hosted Heroku alternative. You can read more about it [here](https://dokku.com).
:::

## Docker-based deploys

You can deploy your Mangobase app using Docker. When you use the [Mangobase CLI](/guide/getting-started#starting-a-new-project), it will generate a `Dockerfile` for you. You can then build and run the Docker image:

```bash
$ docker build -t my-mangobase-app .
$ docker run -p 8000:5000 my-mangobase-app --env=SECRET_KEY=xA90boi2 --env=DATABASE_URL=mongodb://host.docker.internal:27017/mangobase-app-db
```

## Deploying to Heroku

Add a `heroku.yml` file with the following content:

```yaml
build:
  docker:
    web: Dockerfile
```

Then make a `git push` to your project.

Remember to do set the `SECRET_KEY` and `DATABASE_URL` environment variables in your Heroku app.

```bash
$ heroku config:set SECRET_KEY=xA90boi2 DATABASE_URL=mongodb://host.docker.internal:27017/mangobase-app-db
```

Or you can use the [Heroku dashboard](https://devcenter.heroku.com/articles/config-vars#using-the-heroku-dashboard) to set the environment variables.

Read more from [here](https://devcenter.heroku.com/articles/build-docker-images-heroku-yml) on how to deploy Dockerfile based apps to Heroku.
