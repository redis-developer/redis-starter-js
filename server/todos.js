import express from "express";
import { v4 as uuid } from "uuid";
import getClient from "./redis.js";
import { SchemaFieldTypes } from "redis";

const TODOS_INDEX = "todos-idx";
const TODOS_PREFIX = "todos:";

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

/**
 * Initializes todo index if necessary
 */
export async function initialize() {
  const redis = await getClient();
  const indexes = await redis.ft._list();
  const haveIndex = indexes.some((index) => {
    return index === TODOS_INDEX;
  });

  if (!haveIndex) {
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
      }
    );
  }
}

/**
 * Gets all todos
 *
 * @returns {Promise<Todos>}
 */
async function all() {
  const redis = await getClient();

  return /** @type {Promise<Todos>} */ (redis.ft.search(TODOS_INDEX, "*"));
}

/**
 * Get a todo by id
 *
 * @param {string} id
 * @returns {Promise<Todo | TodoError | null>}
 */
async function one(id) {
  const redis = await getClient();

  const todo = await redis.json.get(
    /todos/.test(id) ? id : `${TODOS_PREFIX}${id}`
  );

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
async function search(name, status) {
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
async function create(id, name) {
  const redis = await getClient();
  const date = new Date();

  if (!name) {
    return { status: 400, message: "Todo must have a name" };
  }

  /**
   * @type {TodoDocument}
   */
  const todo = {
    id: `${TODOS_PREFIX}${id ?? uuid()}`,
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
async function update(id, status) {
  const redis = await getClient();
  const date = new Date();

  const todoOrError = await one(id);

  if (!todoOrError || isFinite(/** @type {number} */(todoOrError.status))) {
    return { status: 404, message: "Not Found" };
  }

  const todo = /** @type {Todo} */ (todoOrError);
  todo.status = status;
  todo.updated_date = date.toISOString();

  const result = await redis.json.set(
    `${TODOS_PREFIX}${id ?? uuid()}`,
    "$",
    todo
  );

  if (result?.toUpperCase() === "OK") {
    return todo;
  } else {
    return { status: 400, message: "Todo is invalid" };
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
      res.status(500).json(e);
    }
  };
}

router.get(
  "/",
  handler(async () => {
    return all();
  })
);

router.get(
  "/:id",
  handler(async (req) => {
    const { id } = req.params;

    return one(id);
  })
);

router.post(
  "/search",
  handler(async (req) => {
    const { name, status } = req.body;

    return search(name, status);
  })
);

router.post(
  "/",
  handler(async (req) => {
    const { name, id } = req.body;

    return create(id, name);
  })
);

router.patch(
  "/:id",
  handler(async (req) => {
    const { id } = req.params;
    const { status } = req.body;

    return update(id, status);
  })
);
