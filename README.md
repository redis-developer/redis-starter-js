This is a [Redis](https://redis.io/) starter template for JS and [Node](https://nodejs.org/) using:

- [Redis Cloud](https://redis.io/try-free/)
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting started

Copy and edit the `.env` file:

```bash
cp .env.example .env.docker
cp .env.example .env.local
```

Your `.env.local` file should contain the connection string you copied from Redis Cloud.

Your `.env.docker` file will look similar to `.env.local`, but should use the appropriate docker internal URLs. Here is
an example:

```bash
API_URL="http://app:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
REDIS_URL="redis://redis:6379"
```

Next, install dependencies:

```bash
npm i
```

Then, spin up docker containers:

```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Running locally outside docker
To run the development server outside of docker:

```bash
npm install
# then
npm run dev
```

## Learn more

To learn more about Redis, take a look at the following resources:

- [Redis Documentation](https://redis.io/docs/latest/) - learn about Redis products, features, and commands.
- [Learn Redis](https://redis.io/learn/) - read tutorials, quick starts, and how-to guides for Redis.
- [Redis Demo Center](https://redis.io/demo-center/) - watch short, technical videos about Redis products and features.

