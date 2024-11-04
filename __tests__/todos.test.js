import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import request from "supertest";
import app from "../server/app.js";
import * as todos from "../server/todos.js";

describe("Todos", () => {
  beforeAll(async () => {
    await todos.initialize();
  });

  beforeEach(async () => {
    await todos.delAll();
  });

  afterAll(async () => {
    await todos.delAll();
    await todos.dropIndex();
  });

  test("CRUD for a single todo", async () => {
    const { body: createResult } = await request(app)
      .post("/api/todos")
      .send({ name: "Take out the trash" })
      .expect(200);

    const createdTodo = createResult.value;
    const todoId = createResult.id;

    expect(createdTodo.name).toBe("Take out the trash");
    expect(createdTodo.status).toBe("todo");

    const { body: readResult } = await request(app)
      .get(`/api/todos/${todoId}`)
      .send()
      .expect(200);

    expect(readResult.name).toBe(createdTodo.name);
    expect(readResult.status).toBe(createdTodo.status);

    const { body: updateResult } = await request(app)
      .patch(`/api/todos/${todoId}`)
      .send({ status: "complete" })
      .expect(200);

    expect(updateResult.name).toBe(readResult.name);
    expect(updateResult.status).toBe("complete");
    expect(
      new Date(updateResult.updated_date) > new Date(updateResult.created_date),
    ).toBe(true);
    expect(
      new Date(updateResult.updated_date) > new Date(readResult.updated_date),
    ).toBe(true);

    await request(app).delete(`/api/todos/${todoId}`).send().expect(200);
  });

  test("Create and read multiple todos", async () => {
    const todos = [
      "Take out the trash",
      "Vacuum downstairs",
      "Fold the laundry",
    ];

    for (const todo of todos) {
      await request(app).post("/api/todos").send({ name: todo }).expect(200);
    }

    const { body: allTodos } = await request(app)
      .get("/api/todos")
      .send()
      .expect(200);

    expect(allTodos.total).toBe(todos.length);

    for (const todo of allTodos.documents) {
      expect(todos).toContain(todo.value.name);
    }
  });
});
