import {
  CreateTodoSchema,
  UpdateTodoSchema,
  SearchTodosSchema,
  TodoIdSchema,
} from "./validator.js";
import * as model from "./model.js";

export function getAll() {
  return model.all();
}

export function getOne(params: unknown) {
  const { id } = TodoIdSchema.parse(params);
  return model.one(id);
}

export function search(query: unknown) {
  const { name, status } = SearchTodosSchema.parse(query);
  return model.search(name, status);
}

export function create(body: unknown) {
  const { id, name } = CreateTodoSchema.parse(body);
  return model.create(id, name);
}

export function update(params: unknown, body: unknown) {
  const { id } = TodoIdSchema.parse(params);
  const { status } = UpdateTodoSchema.parse(body);
  return model.update(id, status);
}

export function del(params: unknown) {
  const { id } = TodoIdSchema.parse(params);
  return model.del(id);
}
