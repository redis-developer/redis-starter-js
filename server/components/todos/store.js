import { v4 as uuid } from "uuid";
import getClient from "../../redis.js";
import { SchemaFieldTypes } from "redis";

/**
 * An error object
 * @typedef {Object} TodoError
 * @property {number} status
 * @property {string} message
 *
 * A todo status
 * @typedef {"todo" | "in progress" | "complete"} TodoStatus
 *
 * A todo object
 * @typedef {Object} Todo
 * @property {string} name
 * @property {TodoStatus} status
 * @property {string} created_date
 * @property {string} updated_date
 *
 * A todo document
 * @typedef {Object} TodoDocument
 * @property {string} id
 * @property {Todo} value
 *
 * A todo object
 * @typedef {Object} Todos
 * @property {number} total
 * @property {TodoDocument[]} documents
 */

const TODOS_INDEX = "todos-idx";
const TODOS_PREFIX = "todos:";

/**
 * Checks if the TODOS_INDEX already exists in Redis
 *
 * @returns {Promise<boolean>}
 */
async function haveIndex() {
  const redis = await getClient();
  const indexes = await redis.ft._list();

  return indexes.some((index) => {
    return index === TODOS_INDEX;
  });
}

/**
 * Creates the TODOS_INDEX if it doesn't exist already
 *
 * @returns {Promise<void>}
 */
export async function createIndexIfNotExists() {
  const redis = await getClient();

  if (!(await haveIndex())) {
    await redis.ft.create(
      TODOS_INDEX,
      {
        "$.name": {
          AS: "name",
          type: SchemaFieldTypes.TEXT,
        },
        "$.status": {
          AS: "status",
          type: SchemaFieldTypes.TEXT,
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
 *
 * @returns {Promise<void>}
 */
export async function dropIndex() {
  const redis = await getClient();

  if (await haveIndex()) {
    await redis.ft.dropIndex(TODOS_INDEX);
  }
}

/**
 * Initializes todo index if necessary
 *
 * @returns {Promise<void>}
 */
export async function initialize() {
  await createIndexIfNotExists();
}

const TODO_REGEXP = new RegExp(`^${TODOS_PREFIX}`);

/**
 * Allow for id with or without TODOS_PREFIX
 *
 * @param {string} id
 * @returns {string}
 */
function formatId(id) {
  return TODO_REGEXP.test(id) ? id : `${TODOS_PREFIX}${id}`;
}

/**
 * Gets all todos
 *
 * @returns {Promise<Todos>}
 */
export async function all() {
  const redis = await getClient();

  return /** @type {Promise<Todos>} */ (redis.ft.search(TODOS_INDEX, "*"));
}

/**
 * Gets a todo by id
 *
 * @param {string} id
 * @returns {Promise<Todo | TodoError | null>}
 */
export async function one(id) {
  const redis = await getClient();

  const todo = await redis.json.get(formatId(id));

  if (!todo) {
    return { status: 404, message: "Not Found" };
  }

  return /** @type {Todo} */ (todo);
}

/**
 * Searches for todos by name and/or status
 *
 * @param {string} [name]
 * @param {string} [status]
 * @returns {Promise<Todos>}
 */
export async function search(name, status) {
  const redis = await getClient();
  const searches = [];

  if (name) {
    searches.push(`@name:(${name})`);
  }

  if (status) {
    searches.push(`@status:"${status}"`);
  }

  return /** @type {Promise<Todos>} */ (
    redis.ft.search(TODOS_INDEX, searches.join(" "))
  );
}

/**
 * Creates a todo
 *
 * @param {string} [id]
 * @param {string} [name]
 * @returns {Promise<TodoDocument | TodoError>}
 */
export async function create(id, name) {
  const redis = await getClient();
  const date = new Date();

  if (!name) {
    return { status: 400, message: "Todo must have a name" };
  }

  /**
   * @type {TodoDocument}
   */
  const todo = {
    id: formatId(id ?? uuid()),
    value: {
      name,
      status: "todo",
      created_date: date.toISOString(),
      updated_date: date.toISOString(),
    },
  };

  const result = await redis.json.set(todo.id, "$", todo.value);

  if (result?.toUpperCase() === "OK") {
    return todo;
  } else {
    return { status: 400, message: "Todo is invalid" };
  }
}

/**
 * Updates a todo
 *
 * @param {string} id
 * @param {TodoStatus} status
 * @returns {Promise<Todo | TodoError>}
 */
export async function update(id, status) {
  const redis = await getClient();
  const date = new Date();

  const todoOrError = await one(id);

  if (!todoOrError || isFinite(/** @type {number} */ (todoOrError.status))) {
    return { status: 404, message: "Not Found" };
  }

  const todo = /** @type {Todo} */ (todoOrError);
  todo.status = status;
  todo.updated_date = date.toISOString();

  const result = await redis.json.set(formatId(id), "$", todo);

  if (result?.toUpperCase() === "OK") {
    return todo;
  } else {
    return { status: 400, message: "Todo is invalid" };
  }
}

/**
 * Deletes a todo
 *
 * @param {string} id
 */
export async function del(id) {
  const redis = await getClient();

  await redis.json.del(formatId(id));
}

/**
 * Delete all todos
 *
 * @returns {Promise<void>}
 */
export async function delAll() {
  const redis = await getClient();
  const todos = await all();

  if (todos.total > 0) {
    await redis.del(todos.documents.map((todo) => todo.id));
  }
}
