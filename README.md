This is a [Redis](https://redis.io/) starter template for JS and [Node](https://nodejs.org/) using:

- [Redis Cloud](https://redis.io/try-free/)
- [Express](https://expressjs.com/)

## Getting started

Copy and edit the `.env` file:

```bash
cp .env.example .env.docker
cp .env.example .env
```

Your `.env` file should contain the connection string you copied from Redis Cloud.

Your `.env.docker` file will look similar to `.env`, but should use the appropriate docker internal URLs. Here is
an example:

```bash
API_URL="http://app:3000"
REDIS_URL="redis://redis:6379"
```

Next, spin up docker containers:

```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can now edit the files in
`./server` and it will update the docker container and restart the server.

## Running production docker

There is a single `Dockerfile` setup to run in `dev` mode and `prod` mode. By default the `docker-compose.yml` file
uses `dev` mode. This will run a server that watches the files for changes and restarts accordingly. When deploying,
you will want to run in `prod` mode. To do that remove the following lines in the `docker-compose.yaml` file:

```yaml
target: dev
command: npm run dev
```

## Running tests

There are some tests in the `__tests__` folder that can be run with the following command:

```bash
npm test
```

These tests setup and teardown on their own. You can modify them if you want to leave data in Redis.

## Running locally outside docker

To run the development server outside of docker:

```bash
npm install
# then
npm run dev
```

## Other Scripts

Formatting code:

```bash
npm run format
```

## Connecting to Redis Cloud

If you don't yet have a database setup in Redis Cloud [get started here for free](https://redis.io/try-free/).

To connect to a Redis Cloud database, log into the console and find the following:

1. The `public endpoint` (looks like `redis-#####.c###.us-east-1-#.ec2.redns.redis-cloud.com:#####`)
1. Your `username` (`default` is the default username, otherwise find the one you setup)
1. Your `password` (either setup through Data Access Control, or available in the `Security` section of the database
   page.

Combine the above values into a connection string and put it in your `.env` and `.env.docker` accordingly. It should
look something like the following:

```bash
REDIS_URL="redis://default:<password>@redis-#####.c###.us-west-2-#.ec2.redns.redis-cloud.com:#####"
```

Run the [tests](#running-tests) to verify that you are connected properly.

## Learn more

To learn more about Redis, take a look at the following resources:

- [Redis Documentation](https://redis.io/docs/latest/) - learn about Redis products, features, and commands.
- [Learn Redis](https://redis.io/learn/) - read tutorials, quick starts, and how-to guides for Redis.
- [Redis Demo Center](https://redis.io/demo-center/) - watch short, technical videos about Redis products and features.
