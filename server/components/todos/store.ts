import { v4 as uuid } from "uuid";
import redis from "../../redis.js";
import { RedisJSON, SCHEMA_FIELD_TYPE } from "redis";

/**
 * An error object
 */
export interface TodoError {
  status: number;
  message: string;
}

export type TodoStatus = "todo" | "in progress" | "complete";

export interface Todo {
  name: string;
  status: TodoStatus;
  created_date: string;
  updated_date: string;
}

export interface TodoDocument {
  id: string;
  value: Todo;
}

export interface Todos {
  total: number;
  documents: TodoDocument[];
}

const TODOS_INDEX = "todos-idx";
const TODOS_PREFIX = "todos:";

/**
 * Checks if the TODOS_INDEX already exists in Redis
 */
async function haveIndex(): Promise<boolean> {
  const indexes = await redis.ft._list();

  return indexes.some((index) => {
    return index === TODOS_INDEX;
  });
}

/**
 * Creates the TODOS_INDEX if it doesn't exist already
 */
export async function createIndexIfNotExists(): Promise<void> {
  if (!(await haveIndex())) {
    await redis.ft.create(
      TODOS_INDEX,
      {
        "$.name": {
          AS: "name",
          type: SCHEMA_FIELD_TYPE.TEXT,
        },
        "$.status": {
          AS: "status",
          type: SCHEMA_FIELD_TYPE.TEXT,
        },
      },
      {
        ON: "JSON",
        PREFIX: TODOS_PREFIX,
      },
    );
  }
}

/**
 * Drops the TODOS_INDEX if it exists
 */
export async function dropIndex(): Promise<void> {
  if (await haveIndex()) {
    await redis.ft.dropIndex(TODOS_INDEX);
  }
}

/**
 * Initializes todo index if necessary
 */
export async function initialize(): Promise<void> {
  await createIndexIfNotExists();
}

const TODO_REGEXP = new RegExp(`^${TODOS_PREFIX}`);

/**
 * Allow for id with or without TODOS_PREFIX
 */
function formatId(id: string): string {
  return TODO_REGEXP.test(id) ? id : `${TODOS_PREFIX}${id}`;
}

/**
 * Gets all todos}
 */
export async function all(): Promise<Todos> {
  const results = await redis.ft.search(TODOS_INDEX, "*");

  return results as unknown as Todos;
}

/**
 * Gets a todo by id
 */
export async function one(id: string): Promise<Todo | TodoError | null> {
  const todo = await redis.json.get(formatId(id));

  if (!todo) {
    return { status: 404, message: "Not Found" };
  }

  return todo as unknown as Todo;
}

/**
 * Searches for todos by name and/or status
 */
export async function search(name: string, status: TodoStatus): Promise<Todos> {
  const searches = [];

  if (name) {
    searches.push(`@name:(${name})`);
  }

  if (status && ["todo", "in progress", "complete"].includes(status)) {
    searches.push(`@status:"${status}"`);
  }

  const result = await redis.ft.search(TODOS_INDEX, searches.join(" "));

  return result as unknown as Todos;
}

/**
 * Creates a todo
 */
export async function create(
  id: string,
  name: string,
): Promise<TodoDocument | TodoError> {
  const date = new Date();

  if (!name) {
    return { status: 400, message: "Todo must have a name" };
  }

  const todo: TodoDocument = {
    id: formatId(id ?? uuid()),
    value: {
      name,
      status: "todo",
      created_date: date.toISOString(),
      updated_date: date.toISOString(),
    },
  };

  const result = await redis.json.set(
    todo.id,
    "$",
    todo.value as unknown as RedisJSON,
  );

  if (result?.toUpperCase() === "OK") {
    return todo as TodoDocument;
  } else {
    return { status: 400, message: "Todo is invalid" };
  }
}

/**
 * Updates a todo
 */
export async function update(
  id: string,
  status: TodoStatus,
): Promise<TodoError | Todo> {
  const date = new Date();

  const todoOrError = await one(id);

  if (!todoOrError || isFinite(todoOrError.status as number)) {
    return { status: 404, message: "Not Found" };
  }

  const todo = todoOrError as Todo;
  todo.status = status;
  todo.updated_date = date.toISOString();

  const result = await redis.json.set(formatId(id), "$", todo as any);

  if (result?.toUpperCase() === "OK") {
    return todo;
  } else {
    return { status: 400, message: "Todo is invalid" };
  }
}

/**
 * Deletes a todo
 */
export async function del(id: string): Promise<void> {
  await redis.json.del(formatId(id));
}

/**
 * Delete all todos
 */
export async function delAll(): Promise<void> {
  const todos = await all();

  if (todos.total > 0) {
    await redis.del(todos.documents.map((todo) => todo.id));
  }
}
