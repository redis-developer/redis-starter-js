import express from "express";
import * as todos from "./components/todos/index.js";

export async function initialize() {
  await todos.initialize();
}

const app = express();

app.use(express.json());
app.use("/api/todos", todos.router);

export default app;
