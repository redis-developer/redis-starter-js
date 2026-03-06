import { z } from "zod";

const NodeEnv = z
  .enum(["development", "test", "production"])
  .default("development");

const LogLevel = z
  .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
  .default("info");

const ConfigSchema = z.object({
  NODE_ENV: NodeEnv,
  PORT: z.coerce.number().default(8080),
  REDIS_URL: z.url(),
  LOG_LEVEL: LogLevel,
  LOG_STREAM_KEY: z.string().default("logs"),
});

const parsed = ConfigSchema.parse(process.env);

export const config = {
  ...parsed,
  isDevelopment: parsed.NODE_ENV === "development",
  isTest: parsed.NODE_ENV === "test",
  isProduction: parsed.NODE_ENV === "production",
};
