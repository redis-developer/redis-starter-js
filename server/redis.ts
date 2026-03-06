import { createClient } from "redis";

if (!process.env.REDIS_URL) {
  console.error("REDIS_URL not set");
}

export const redis = await createClient({ url: process.env.REDIS_URL })
  .on("error", (err) => {
    console.log("Redis Client Error", err);
  })
  .connect();
