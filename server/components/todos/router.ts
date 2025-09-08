import express from "express";
import type { Request, Response, NextFunction } from "express";
import { all, one, search, create, update, del } from "./store.js";
import type { TodoStatus } from "./store.js";

export const router = express.Router();

function handler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
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
  "/search",
  handler(async (req) => {
    const { name, status } = req.params;

    return search(name, status as TodoStatus);
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
