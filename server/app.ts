import express from "express";
import * as todos from "./components/todos/index.js";

export async function initialize() {
  await todos.initialize();
}

const app = express();

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    express.json({ limit: "10mb" })(req, res, next);
  } else {
    next();
  }
});
app.use("/api/todos", todos.router);

export default app;
