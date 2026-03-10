import { createClient } from "redis";
import { config } from "./config.js";

export const redis = await createClient({ url: config.REDIS_URL })
  .on("error", (err) => {
    console.error("Redis Client Error");
    console.error(err);
  })
  .connect();
