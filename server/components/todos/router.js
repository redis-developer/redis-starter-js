import express from "express";
import { all, one, search, create, update, del } from "./store.js";

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
  "/search",
  handler(async (req) => {
    const { name, status } = req.params;

    return search(name, status);
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
