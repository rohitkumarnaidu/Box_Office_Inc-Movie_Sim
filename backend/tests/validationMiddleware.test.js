import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { validate } from "../src/middleware/validationMiddleware.js";
import { errorHandler } from "../src/middleware/errorMiddleware.js";

test("validationMiddleware parses correct input and calls next", async () => {
  const schema = {
    body: z.object({
      name: z.string(),
      age: z.number(),
    }),
  };

  const req = {
    body: {
      name: "Test User",
      age: 25,
    },
  };

  let nextCalled = false;
  let nextError = null;

  const next = (err) => {
    nextCalled = true;
    nextError = err;
  };

  const middleware = validate(schema);
  await middleware(req, {}, next);

  assert.ok(nextCalled);
  assert.equal(nextError, undefined);
  assert.equal(req.body.name, "Test User");
  assert.equal(req.body.age, 25);
});

test("validationMiddleware passes validation error to next", async () => {
  const schema = {
    body: z.object({
      name: z.string(),
      age: z.number(),
    }),
  };

  const req = {
    body: {
      name: "Test User",
      age: "not-a-number",
    },
  };

  let nextCalled = false;
  let nextError = null;

  const next = (err) => {
    nextCalled = true;
    nextError = err;
  };

  const middleware = validate(schema);
  await middleware(req, {}, next);

  assert.ok(nextCalled);
  assert.ok(nextError instanceof z.ZodError);
});

test("errorHandler formats ZodError correctly", () => {
  const zodError = new z.ZodError([
    {
      code: "invalid_type",
      expected: "number",
      received: "string",
      path: ["age"],
      message: "Expected number, received string",
    },
  ]);

  let resStatus = null;
  let resJson = null;

  const res = {
    status: (code) => {
      resStatus = code;
      return res;
    },
    json: (data) => {
      resJson = data;
      return res;
    },
  };

  errorHandler(zodError, {}, res, () => {});
assert.equal(resStatus, 400);
  assert.deepEqual(resJson, {
    success: false,
    code: "VALIDATION_ERROR",
    message: "Request validation failed",
    errors: [
      {
        field: "age",
        message: "Expected number, received string",
      },
    ],
  });
});
