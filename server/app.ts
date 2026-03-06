import express from "express";
import type { Request, Response, NextFunction } from "express";
import { pinoHttp } from "pino-http";
import { ZodError } from "zod";
import { ClientError } from "./errors.js";
import { log, httpLog } from "./log.js";
import * as todos from "./components/todos/index.js";

export async function initialize() {
  await todos.initialize();
}

export const app = express();

app.use(pinoHttp({ logger: httpLog }));
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    express.json({ limit: "10mb" })(req, res, next);
  } else {
    next();
  }
});

app.use("/api/todos", todos.router);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 400,
      message: err.issues.map((i) => i.message).join(", "),
    });
  } else if (err instanceof ClientError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  } else {
    log.error(err, "Unhandled error");
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});
