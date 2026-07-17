import "./helpers/testEnv.js";

import test, { before, after } from "node:test";
import assert from "node:assert";

// ---------------------------------------------------------------------------
// API smoke tests that exercise the Express app's wiring (routing, the 404
// handler, and security middleware) WITHOUT touching the database. The app is
// started on an ephemeral port and hit with the built-in fetch client.
//
// These routes do not connect to MongoDB, so this suite runs anywhere —
// including offline / sandboxed environments.
// ---------------------------------------------------------------------------

let server;
let baseUrl;

before(async () => {
  const { default: app } = await import("../src/app.js");
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test("GET /api/health returns 200 with the API banner", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.match(body.message, /Box-Office-Inc API Running/);
});

test("an unknown route returns the 404 JSON envelope", async () => {
  const res = await fetch(`${baseUrl}/api/no-such-route`);
  assert.strictEqual(res.status, 404);
  const body = await res.json();
  assert.strictEqual(body.success, false);
  assert.match(body.message, /not found/i);
});

test("security middleware (helmet) sets X-Content-Type-Options: nosniff", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.headers.get("x-content-type-options"), "nosniff");
});
