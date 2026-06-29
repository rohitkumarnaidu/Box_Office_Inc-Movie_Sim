import test from "node:test";
import assert from "node:assert";

import { hashPassword, comparePassword } from "../src/services/auth/authService.js";

// ---------------------------------------------------------------------------
// authService — password hashing. Pure bcrypt, no database required, so this
// suite runs anywhere (including offline / sandboxed environments).
// ---------------------------------------------------------------------------

test("hashPassword returns a bcrypt hash that is not the plaintext", async () => {
  const hash = await hashPassword("Sup3rSecret!");
  assert.notStrictEqual(hash, "Sup3rSecret!");
  // bcrypt hashes start with $2a$ / $2b$ / $2y$ followed by the cost factor.
  assert.match(hash, /^\$2[aby]\$\d{2}\$/);
});

test("hashPassword uses a random salt (two hashes of the same password differ)", async () => {
  const a = await hashPassword("samePassword");
  const b = await hashPassword("samePassword");
  assert.notStrictEqual(a, b);
});

test("comparePassword returns true for the correct password", async () => {
  const hash = await hashPassword("correct-horse-battery");
  assert.strictEqual(await comparePassword("correct-horse-battery", hash), true);
});

test("comparePassword returns false for an incorrect password", async () => {
  const hash = await hashPassword("correct-horse-battery");
  assert.strictEqual(await comparePassword("wrong-password", hash), false);
});
