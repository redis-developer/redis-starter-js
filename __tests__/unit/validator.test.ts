import { describe, expect, test } from "bun:test";
import { ZodError } from "zod";
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  SearchTodosSchema,
  TodoIdSchema,
} from "../../server/components/todos/validator.js";

describe("CreateTodoSchema", () => {
  test("accepts a valid name", () => {
    const result = CreateTodoSchema.parse({ name: "Buy groceries" });
    expect(result.name).toBe("Buy groceries");
    expect(result.id).toBeUndefined();
  });

  test("accepts name with optional id", () => {
    const result = CreateTodoSchema.parse({ name: "Buy groceries", id: "abc" });
    expect(result.name).toBe("Buy groceries");
    expect(result.id).toBe("abc");
  });

  test("rejects empty name", () => {
    expect(() => CreateTodoSchema.parse({ name: "" })).toThrow(ZodError);
  });

  test("rejects missing name", () => {
    expect(() => CreateTodoSchema.parse({})).toThrow(ZodError);
  });

  test("rejects non-string name", () => {
    expect(() => CreateTodoSchema.parse({ name: 123 })).toThrow(ZodError);
  });

  test("strips unknown fields", () => {
    const result = CreateTodoSchema.parse({ name: "Test", extra: true });
    expect(result).toEqual({ name: "Test" });
  });
});

describe("UpdateTodoSchema", () => {
  test.each(["todo", "in progress", "complete"] as const)(
    'accepts status "%s"',
    (status) => {
      const result = UpdateTodoSchema.parse({ status });
      expect(result.status).toBe(status);
    },
  );

  test("rejects invalid status", () => {
    expect(() => UpdateTodoSchema.parse({ status: "invalid" })).toThrow(
      ZodError,
    );
  });

  test("rejects missing status", () => {
    expect(() => UpdateTodoSchema.parse({})).toThrow(ZodError);
  });
});

describe("SearchTodosSchema", () => {
  test("accepts empty query", () => {
    const result = SearchTodosSchema.parse({});
    expect(result.name).toBeUndefined();
    expect(result.status).toBeUndefined();
  });

  test("accepts name only", () => {
    const result = SearchTodosSchema.parse({ name: "groceries" });
    expect(result.name).toBe("groceries");
  });

  test("accepts status only", () => {
    const result = SearchTodosSchema.parse({ status: "complete" });
    expect(result.status).toBe("complete");
  });

  test("accepts both name and status", () => {
    const result = SearchTodosSchema.parse({
      name: "groceries",
      status: "todo",
    });
    expect(result.name).toBe("groceries");
    expect(result.status).toBe("todo");
  });

  test("rejects invalid status", () => {
    expect(() => SearchTodosSchema.parse({ status: "invalid" })).toThrow(
      ZodError,
    );
  });
});

describe("TodoIdSchema", () => {
  test("accepts a valid id", () => {
    const result = TodoIdSchema.parse({ id: "abc-123" });
    expect(result.id).toBe("abc-123");
  });

  test("rejects empty id", () => {
    expect(() => TodoIdSchema.parse({ id: "" })).toThrow(ZodError);
  });

  test("rejects missing id", () => {
    expect(() => TodoIdSchema.parse({})).toThrow(ZodError);
  });
});
