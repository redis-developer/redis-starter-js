import express from "express";
import type { Request, Response } from "express";
import * as controller from "./controller.js";

export const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  res.json(await controller.getAll());
});

router.get("/search", async (req: Request, res: Response) => {
  res.json(await controller.search(req.query));
});

router.get("/:id", async (req: Request, res: Response) => {
  res.json(await controller.getOne(req.params));
});

router.post("/", async (req: Request, res: Response) => {
  res.json(await controller.create(req.body));
});

router.patch("/:id", async (req: Request, res: Response) => {
  res.json(await controller.update(req.params, req.body));
});

router.delete("/:id", async (req: Request, res: Response) => {
  res.json(await controller.del(req.params));
});
