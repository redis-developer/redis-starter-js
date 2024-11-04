import express from "express";
import { v4 as uuid } from "uuid";
import getClient from "./redis.js";
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

async function haveIndex() {
  const redis = await getClient();
  const indexes = await redis.ft._list();

  return indexes.some((index) => {
    return index === TODOS_INDEX;
  });
}

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

export async function dropIndex() {
  const redis = await getClient();

  if (await haveIndex()) {
    await redis.ft.dropIndex(TODOS_INDEX);
  }
}

/**
 * Initializes todo index if necessary
 */
export async function initialize() {
  await createIndexIfNotExists();
}

/**
 * Allow for id with or without todos: prefix
 * @param {string} id
 * @returns {string}
 */
function formatId(id) {
  return /todos/.test(id) ? id : `${TODOS_PREFIX}${id}`;
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
 * Get a todo by id
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
 * Search for todos by name and/or status
 *
 * @param {string} [name]
 * @param {string} [status]
 * @returns {Promise<Todos>}
 */
export async function search(name, status) {
  const redis = await getClient();
  const searches = [];

  if (name) {
    searches.push(`@name:{${name}}`);
  }

  if (status) {
    searches.push(`@status:"${status}"`);
  }

  return /** @type {Promise<Todos>} */ (
    redis.ft.search(TODOS_INDEX, searches.join(" "))
  );
}

/**
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
 * Update a todo
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
 * Delete a todo
 * @param {string} id
 */
export async function del(id) {
  const redis = await getClient();

  await redis.json.del(formatId(id));
}

/**
 * Delete all todos
 */
export async function delAll() {
  const redis = await getClient();
  const todos = await all();

  if (todos.total > 0) {
    await redis.del(todos.documents.map((todo) => todo.id));
  }
}

export const router = express.Router();

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

/**
 *
 * @param {(req: Request, res: Response, next: NextFunction) => Promise<any>} fn
 * @returns
 */
function handler(fn) {
  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  return async (req, res, next) => {
    try {
      let nextCalled = false;
      const result = await fn(req, res, (...args) => {
        nextCalled = true;
        next(...args);
      });

      if (nextCalled) {
        return;
      } else if (result && isFinite(result.status)) {
        res.status(result.status).json(result);
      } else {
        res.json(result);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  };
}

router.get(
  "/",
  handler(async () => {
    return all();
  }),
);

router.get(
  "/:id",
  handler(async (req) => {
    const { id } = req.params;

    return one(id);
  }),
);

router.post(
  "/search",
  handler(async (req) => {
    const { name, status } = req.body;

    return search(name, status);
  }),
);

router.post(
  "/",
  handler(async (req) => {
    const { name, id } = req.body;

    return create(id, name);
  }),
);

router.patch(
  "/:id",
  handler(async (req) => {
    const { id } = req.params;
    const { status } = req.body;

    return update(id, status);
  }),
);

router.delete(
  "/:id",
  handler(async (req) => {
    const { id } = req.params;

    return del(id);
  }),
);
