import { describe, expect, test } from "bun:test";
import { ClientError } from "../../server/errors.js";

describe("ClientError", () => {
  test("is an instance of Error", () => {
    const err = new ClientError(400, "Bad Request");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ClientError);
  });

  test("stores status and message", () => {
    const err = new ClientError(404, "Not Found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not Found");
  });

  test("can be caught as Error", () => {
    try {
      throw new ClientError(500, "Server Error");
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as ClientError).status).toBe(500);
    }
  });
});
