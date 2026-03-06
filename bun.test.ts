import { beforeAll, afterAll } from "bun:test";
import { $ } from "bun";

beforeAll(async () => {
  await $`docker compose up redis -d`;
});

afterAll(async () => {
  const { default: redis } = await import("./server/redis.js");
  await redis.close();

  await $`docker compose down redis`;
});
