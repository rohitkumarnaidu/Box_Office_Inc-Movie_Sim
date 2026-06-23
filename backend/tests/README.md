# Backend Tests

Automated tests for the CineVerse simulation backend, using the built-in
[`node:test`](https://nodejs.org/api/test.html) runner and `node:assert`.

## Running the tests

From the `backend/` directory:

```bash
npm test
```

This runs every `tests/**/*.test.js` file.

To run a single file:

```bash
node --test tests/engines.test.js
node --test tests/integration.lifecycle.test.js
```

## What's covered

### `engines.test.js` — pure unit tests (no database)

Fast, deterministic tests for the side-effect-free simulation engines:

- **reviewEngine** — critic/audience score formulas, label thresholds, and the
  neutral defaults used when talent data is missing.
- **careerImpactEngine** — post-release talent progression: reputation/popularity
  changes, salary multipliers, earnings, and career-history entries for hits,
  disasters, and average releases.
- **payrollEngine** — weekly payroll deduction from studio funds, including the
  partial-payment path when a studio is underfunded.
- **studioGrowthEngine** — fan/prestige/revenue growth, aggregate stats, and
  studio level-ups after a release.

### `integration.lifecycle.test.js` — integration tests (in-memory MongoDB)

End-to-end style tests that run the **production pipeline** against a real
database provided by
[`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server):

- A movie document persists and is retrievable.
- A movie in `PRODUCTION` advances one week per tick (deterministic with neutral
  reliability).
- A movie transitions between production stages when a stage completes.
- An empty production queue is a safe no-op.

> **First run downloads a binary.** `mongodb-memory-server` downloads a `mongod`
> binary from `fastdl.mongodb.org` the first time it runs, so the integration
> tests need network access on first execution (the binary is cached for
> subsequent offline runs). On a machine without network access, run the unit
> tests directly with `node --test tests/engines.test.js`.

### `authService.test.js` / `tokenService.test.js` — auth unit tests (no database)

Side-effect-free coverage of the authentication primitives:

- **authService** — `hashPassword` produces a bcrypt hash (random salt, never the
  plaintext) and `comparePassword` accepts the correct password and rejects a
  wrong one.
- **tokenService** — `createAuthTokenBundle` issues an access token, a refresh
  token, and an expiry; the access token encodes `userId`; `verifyRefreshToken`
  decodes a valid token and throws on a tampered one; `hashRefreshToken` is a
  deterministic sha256 digest.

### `health.api.test.js` — API smoke tests (no database)

Boots the Express app on an ephemeral port and checks wiring without hitting the
database: `GET /api/health` returns 200, unknown routes return the 404 envelope,
and helmet sets `X-Content-Type-Options: nosniff`.

### `auth.api.test.js` / `gameplay.api.test.js` — API & flow tests (in-memory MongoDB)

Full HTTP coverage against a real database from `mongodb-memory-server`:

- **auth.api** — register (creates user + studio + game state, returns a token,
  never leaks the password), duplicate-email and validation rejections, login
  success / wrong-password / unknown-email, and the `GET /api/auth/me` protected
  route with valid, missing, and malformed tokens.
- **gameplay.api** — an end-to-end flow: register a studio, browse the actor
  marketplace, and hire an actor (asserting it lands in the owned roster), plus a
  401 check on unauthenticated access. This suite is independent of the
  signing-fee work (#30) so it passes on the base `elusoc` branch.

> These DB-backed suites download a `mongod` binary on first run (see the note
> above), so they run on a dev machine or in CI.

## Continuous Integration

`.github/workflows/ci.yml` runs the full suite (`npm test`) on every push and
pull request to `elusoc` and `main`, on Node.js 22. The GitHub-hosted runner has
network access, so `mongodb-memory-server` downloads its `mongod` binary there
and the DB-backed suites execute as part of CI.

## Offline vs. network-dependent suites

| Suite | Database | Runs offline |
| --- | --- | --- |
| `engines`, `boxOfficeEngine`, `eventEngine`, `trendEngine`, `marketplaceHelper`, `validationMiddleware` | none | yes |
| `authService`, `tokenService`, `health.api` | none | yes |
| `integration.lifecycle`, `auth.api`, `gameplay.api` | in-memory MongoDB | first run needs network for the `mongod` binary |

To run only the offline-safe suites (e.g. with no network access):

```bash
node --test tests/authService.test.js tests/tokenService.test.js tests/health.api.test.js
```

## Conventions

- Test files are named `*.test.js` and live under `backend/tests/`.
- Unit tests pass plain JavaScript objects to the engines (the engines mutate
  their inputs in place and never touch the database).
- Integration tests connect Mongoose to an ephemeral in-memory server in a
  `before` hook and tear it down in `after`.
