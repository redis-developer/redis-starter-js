import { RedisClientOptions, createClient } from "redis";

if (!process.env.REDIS_URL) {
  console.error("REDIS_URL not set");
}

const redisConfig = {
  url: process.env.REDIS_URL as string,
};

let client: ReturnType<typeof createClient> | null = null;

export default async function getClient(
  options?: RedisClientOptions,
): Promise<ReturnType<typeof createClient>> {
  options = Object.assign(
    {},
    {
      url: redisConfig.url,
    },
    options,
  );

  if (client && client.options?.url === options.url) {
    return client;
  }

  client = createClient(options);

  client
    .on("error", (err) => {
      console.error("Redis Client Error", err);
      void refreshClient();
    })
    .connect();

  return client;
}

async function refreshClient(): Promise<void> {
  if (client) {
    await client.disconnect();
    client = null;
  }

  client = await getClient();
}
