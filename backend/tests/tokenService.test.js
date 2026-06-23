import "./helpers/testEnv.js";

import test from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";

import {
  createAuthTokenBundle,
  verifyRefreshToken,
  decodeRefreshToken,
  hashRefreshToken,
  getAccessTokenExpiresAt,
} from "../src/services/auth/tokenService.js";

// ---------------------------------------------------------------------------
// tokenService — access/refresh token issuance and verification. Pure JWT +
// crypto, no database required, so this suite runs anywhere. It does need the
// JWT secrets, which testEnv.js sets before this module is imported.
// ---------------------------------------------------------------------------

// Plain, low-entropy identifiers. The token service signs whatever string it is
// given, so a real ObjectId is unnecessary here — and a 24-char hex literal
// reads like a high-entropy secret to scanners, so we avoid it.
const USER_ID = "test-user-id-1";

test("createAuthTokenBundle issues an access token, a refresh token, and an expiry", () => {
  const bundle = createAuthTokenBundle(USER_ID);
  assert.ok(bundle.token, "access token present");
  assert.ok(bundle.refreshToken, "refresh token present");
  assert.strictEqual(typeof bundle.accessTokenExpiresAt, "number");
  assert.ok(bundle.accessTokenExpiresAt > Date.now(), "expiry is in the future");
});

test("the access token encodes userId and verifies against the access secret", () => {
  const { token } = createAuthTokenBundle(USER_ID);
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  assert.strictEqual(decoded.userId, USER_ID);
});

test("verifyRefreshToken decodes a valid refresh token to its userId", () => {
  const { refreshToken } = createAuthTokenBundle(USER_ID);
  const decoded = verifyRefreshToken(refreshToken);
  assert.strictEqual(decoded.userId, USER_ID);
});

test("verifyRefreshToken throws on a tampered token", () => {
  const { refreshToken } = createAuthTokenBundle(USER_ID);
  const tampered = refreshToken.slice(0, -1) + (refreshToken.endsWith("a") ? "b" : "a");
  assert.throws(() => verifyRefreshToken(tampered));
});

test("hashRefreshToken is a deterministic sha256 hex digest that differs per token", () => {
  const { refreshToken } = createAuthTokenBundle(USER_ID);
  const { refreshToken: otherUserToken } = createAuthTokenBundle("test-user-id-2");

  assert.strictEqual(
    hashRefreshToken(refreshToken),
    hashRefreshToken(refreshToken),
    "same token hashes to the same value",
  );
  assert.notStrictEqual(
    hashRefreshToken(refreshToken),
    hashRefreshToken(otherUserToken),
    "different tokens hash to different values",
  );
  assert.match(hashRefreshToken(refreshToken), /^[a-f0-9]{64}$/);
});

test("getAccessTokenExpiresAt returns ms epoch and decodeRefreshToken exposes the payload", () => {
  const { token, refreshToken } = createAuthTokenBundle(USER_ID);
  assert.strictEqual(typeof getAccessTokenExpiresAt(token), "number");
  assert.strictEqual(decodeRefreshToken(refreshToken).userId, USER_ID);
});
