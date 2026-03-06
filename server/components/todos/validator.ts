import { z } from "zod";

const TodoStatus = z.enum(["todo", "in progress", "complete"]);

export const CreateTodoSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Todo must have a name"),
});

export const UpdateTodoSchema = z.object({
  status: TodoStatus,
});

export const SearchTodosSchema = z.object({
  name: z.string().optional(),
  status: TodoStatus.optional(),
});

export const TodoIdSchema = z.object({
  id: z.string().min(1),
});
