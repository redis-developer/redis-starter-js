import { createComponentLog } from "../../log.js";
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  SearchTodosSchema,
  TodoIdSchema,
} from "./validator.js";
import * as model from "./model.js";

const log = createComponentLog("todos");

export function getAll() {
  log.debug("Fetching all todos");
  return model.all();
}

export function getOne(params: unknown) {
  const { id } = TodoIdSchema.parse(params);
  log.debug({ id }, "Fetching todo");
  return model.one(id);
}

export function search(query: unknown) {
  const { name, status } = SearchTodosSchema.parse(query);
  log.debug({ name, status }, "Searching todos");
  return model.search(name, status);
}

export function create(body: unknown) {
  const { id, name } = CreateTodoSchema.parse(body);
  log.debug({ id, name }, "Creating todo");
  return model.create(id, name);
}

export function update(params: unknown, body: unknown) {
  const { id } = TodoIdSchema.parse(params);
  const { status } = UpdateTodoSchema.parse(body);
  log.debug({ id, status }, "Updating todo");
  return model.update(id, status);
}

export function del(params: unknown) {
  const { id } = TodoIdSchema.parse(params);
  log.debug({ id }, "Deleting todo");
  return model.del(id);
}
