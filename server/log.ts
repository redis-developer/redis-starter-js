import pino from "pino";
import pretty from "pino-pretty";
import build from "pino-abstract-transport";
import { redis } from "./redis.js";
import { config } from "./config.js";

const levelLabels: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

function createRedisTransport() {
  return build(async function (source) {
    for await (const log of source) {
      try {
        await redis.xAdd(config.LOG_STREAM_KEY, "*", {
          level: levelLabels[log.level] ?? String(log.level),
          component: log.component ?? "root",
          msg: log.msg ?? "",
          time: String(log.time),
          metadata: JSON.stringify(log),
        });
      } catch {
        // Don't crash the app if Redis logging fails
      }
    }
  });
}

const stdStream = config.isProduction
  ? process.stdout
  : pretty({ colorize: true });

export const httpLog = pino({ level: config.LOG_LEVEL }, stdStream);

export const log = pino(
  { level: config.LOG_LEVEL },
  pino.multistream(
    [{ stream: stdStream }, { stream: createRedisTransport() }].map((s) => ({
      level: config.LOG_LEVEL,
      ...s,
    })),
  ),
);

export function createComponentLog(component: string) {
  return log.child({ component });
}
