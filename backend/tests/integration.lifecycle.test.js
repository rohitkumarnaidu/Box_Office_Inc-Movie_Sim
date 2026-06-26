import { test, before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import Movie from "../src/models/Movie.js";
import { processProduction } from "../src/services/simulation/engines/productionEngine.js";

// ---------------------------------------------------------------------------
// Integration: the production pipeline running against a real (in-memory)
// MongoDB via mongodb-memory-server.
//
// NOTE: mongodb-memory-server downloads a `mongod` binary from
// fastdl.mongodb.org the first time it runs. That download needs network
// access, so this suite must be run in an environment that allows it
// (a normal dev machine / CI). See tests/README.md.
//
// `processProduction(gameState, studio)` only touches the database through the
// Movie model; it never persists the gameState or studio, so those are passed
// as plain objects here. With no owned talent, average reliability is the
// neutral 50, which makes weekly progress a deterministic +1 (no random delay
// or bonus) — so these assertions are exact.
// ---------------------------------------------------------------------------

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

const PRE_PRODUCTION_WEEKS = 4;
const PRODUCTION_WEEKS = 10;
const TOTAL_WEEKS = 20; // 4 + 10 + 6

const makeMovie = (overrides = {}) =>
  Movie.create({
    title: "Test Movie",
    studioId: new mongoose.Types.ObjectId(),
    scriptId: "script-1",
    directorId: "dir-1",
    leadActorId: "actor-1",
    crewTeamId: "crew-1",
    createdWeek: 1,
    status: "PRODUCTION",
    weeksInStage: 0,
    ...overrides,
  });

const makeGameState = (activeMovies, currentWeek = 10) => ({
  currentWeek,
  activeMovies,
  ownedDirectors: [],
  ownedActors: [],
  ownedCrewTeams: [],
});

test("integration: a movie document persists to the in-memory database", async () => {
  const movie = await makeMovie({ title: "Persisted Movie" });
  const found = await Movie.findById(movie._id);
  assert.ok(found, "movie should be retrievable after save");
  assert.strictEqual(found.title, "Persisted Movie");
  assert.strictEqual(found.status, "PRODUCTION");
});

test("integration: production advances a movie one week with neutral reliability", async () => {
  const movie = await makeMovie({ status: "PRODUCTION", weeksInStage: 0 });
  const gameState = makeGameState([movie._id], 10);

  await processProduction(gameState, {});

  const updated = await Movie.findById(movie._id);
  assert.strictEqual(updated.weeksInStage, 1);
  assert.strictEqual(updated.status, "PRODUCTION");
  // currentCompleted (PRE_PRODUCTION) + weeksInStage = 4 + 1 = 5 of 20 -> 25%
  assert.strictEqual(
    updated.productionProgress,
    Math.round(((PRE_PRODUCTION_WEEKS + 1) / TOTAL_WEEKS) * 100)
  );
  assert.strictEqual(updated.remainingWeeks, TOTAL_WEEKS - (PRE_PRODUCTION_WEEKS + 1));
});

test("integration: a completed stage advances PRODUCTION -> POST_PRODUCTION", async () => {
  // One more week (9 -> 10) completes the 10-week PRODUCTION stage.
  const movie = await makeMovie({
    status: "PRODUCTION",
    weeksInStage: PRODUCTION_WEEKS - 1,
  });
  const gameState = makeGameState([movie._id], 5);

  await processProduction(gameState, {});

  const updated = await Movie.findById(movie._id);
  assert.strictEqual(updated.status, "POST_PRODUCTION");
  assert.strictEqual(updated.weeksInStage, 0);
  assert.ok(
    Array.isArray(gameState._pendingNotifications) &&
      gameState._pendingNotifications.length >= 1,
    "a stage-transition notification should be queued"
  );
});

test("integration: no active movies is a safe no-op", async () => {
  const gameState = makeGameState([], 1);
  await assert.doesNotReject(processProduction(gameState, {}));
});
