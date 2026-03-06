import { createClient } from "redis";
import { config } from "./config.js";
import { log } from "./log.js";

export const redis = await createClient({ url: config.REDIS_URL })
  .on("error", (err) => {
    log.error(err, "Redis Client Error");
  })
  .connect();
