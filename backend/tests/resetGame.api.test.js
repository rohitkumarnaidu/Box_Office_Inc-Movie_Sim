import "./helpers/testEnv.js";

import test, { before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import Movie from "../src/models/Movie.js";
import Notification from "../src/models/Notification.js";
import Studio from "../src/models/Studio.js";
import GameState from "../src/models/GameState.js";

let mongod;
let server;
let baseUrl;

before(async () => {
  mongod = await MongoMemoryReplSet.create({
    replSet: { count: 1 }
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);

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
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

const registerUser = async (username, email, studioName) => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password: "password123",
      studioName,
    }),
  });
  return res.json();
};

test("Simulation API - Reset Game clears user data and resets state", async () => {
  try {
    const { token, studio, user } = await registerUser("reset_user", "reset@example.com", "Reset Studio");
    assert.ok(token);

    // 1. Create a mock movie for this studio
    const movie = await Movie.create({
      title: "Mock Blockbuster",
      studioId: studio._id,
      scriptId: "script-123",
      directorId: "director-123",
      leadActorId: "actor-123",
      crewTeamId: "crew-123",
      createdWeek: 1,
      status: "PRODUCTION",
    });
    assert.ok(movie._id);

    // 2. Create a mock notification
    const gameState = await GameState.findOne({ user: user._id });
    const notification = await Notification.create({
      gameStateId: gameState._id,
      message: "Game started!",
    });
    assert.ok(notification._id);

    // 3. Mutate studio money and gameState currentWeek to simulate progression
    const studioDoc = await Studio.findById(studio._id);
    studioDoc.money = 5000000;
    studioDoc.prestige = 100;
    await studioDoc.save();

    const gameStateDoc = await GameState.findOne({ user: user._id });
    gameStateDoc.currentWeek = 10;
    await gameStateDoc.save();

    // 4. Call reset endpoint
    const resetRes = await fetch(`${baseUrl}/api/simulation/reset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    assert.strictEqual(resetRes.status, 200);

    const resetResult = await resetRes.json();
    assert.strictEqual(resetResult.success, true);
    assert.strictEqual(resetResult.studio.money, 10000000);
    assert.strictEqual(resetResult.studio.prestige, 0);
    assert.strictEqual(resetResult.gameState.currentWeek, 1);

    // 5. Verify database documents are deleted
    const moviesCount = await Movie.countDocuments({ studioId: studio._id });
    assert.strictEqual(moviesCount, 0, "All movies should be deleted");

    const notificationsCount = await Notification.countDocuments({ gameStateId: gameState._id });
    assert.strictEqual(notificationsCount, 0, "All notifications should be deleted");
  } catch (err) {
    console.error("TEST FAILED WITH ERROR:", err);
    throw err;
  }
});
