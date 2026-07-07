#!/usr/bin/env node

/**
 * @fileoverview Migration Script — GameState Market Array Decomposition
 *
 * Extracts `marketDirectors`, `marketActors`, and `marketCrewTeams` from
 * existing GameState documents into their own Mongoose collections
 * (MarketDirector, MarketActor, MarketCrewTeam).
 *
 * This is a one-time migration for pre-existing user data. After this script
 * runs, the embedded arrays can be removed from the GameState schema.
 *
 * Usage:
 *   node backend/scripts/migrateGameState.js
 *
 * The script is idempotent — if Market docs already exist for a given userId,
 * that user's data is skipped (assumed already migrated).
 */

import "../src/config/envConfig.js";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import GameState from "../src/models/GameState.js";
import MarketDirector from "../src/models/MarketDirector.js";
import MarketActor from "../src/models/MarketActor.js";
import MarketCrewTeam from "../src/models/MarketCrewTeam.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if any Market docs exist for the given userId. */
const alreadyMigrated = async (userId) => {
  const [d, a, c] = await Promise.all([
    MarketDirector.countDocuments({ userId }),
    MarketActor.countDocuments({ userId }),
    MarketCrewTeam.countDocuments({ userId }),
  ]);
  return d > 0 || a > 0 || c > 0;
};

/**
 * Migrate a single GameState document's market arrays into their own
 * collections, then clear the arrays from the GameState doc.
 */
const migrateOne = async (gs) => {
  const userId = gs.user;

  // --- Market Directors ---
  if (gs.marketDirectors && gs.marketDirectors.length > 0) {
    const docs = gs.marketDirectors.map((d) => ({
      ...d,
      userId,
      // Ensure `id` is present — Mongo uses it as the canonical talent id
      id: d.id || d._id?.toString(),
    }));
    await MarketDirector.insertMany(docs);
  }

  // --- Market Actors ---
  if (gs.marketActors && gs.marketActors.length > 0) {
    const docs = gs.marketActors.map((a) => ({
      ...a,
      userId,
      id: a.id || a._id?.toString(),
    }));
    await MarketActor.insertMany(docs);
  }

  // --- Market Crew Teams ---
  if (gs.marketCrewTeams && gs.marketCrewTeams.length > 0) {
    const docs = gs.marketCrewTeams.map((c) => ({
      ...c,
      userId,
      id: c.id || c._id?.toString(),
    }));
    await MarketCrewTeam.insertMany(docs);
  }

  // Clear the embedded arrays from the GameState document
  if (gs.marketDirectors?.length || gs.marketActors?.length || gs.marketCrewTeams?.length) {
    gs.marketDirectors = [];
    gs.marketActors = [];
    gs.marketCrewTeams = [];
    await gs.save();
  }
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const migrate = async () => {
  console.log("🔌 Connecting to MongoDB...");
  await connectDB();

  console.log("🔍 Finding GameState documents with market arrays...");
  const cursor = GameState.find({
    $or: [
      { marketDirectors: { $exists: true, $ne: [] } },
      { marketActors: { $exists: true, $ne: [] } },
      { marketCrewTeams: { $exists: true, $ne: [] } },
    ],
  }).cursor();

  let total = 0;
  let migrated = 0;
  let skipped = 0;

  for await (const gs of cursor) {
    total++;

    if (await alreadyMigrated(gs.user)) {
      console.log(`  ⏭️  User ${gs.user} — Market collections already populated, skipping`);
      skipped++;
      continue;
    }

    const dCount = gs.marketDirectors?.length || 0;
    const aCount = gs.marketActors?.length || 0;
    const cCount = gs.marketCrewTeams?.length || 0;

    console.log(`  📦 User ${gs.user} — migrating ${dCount} directors, ${aCount} actors, ${cCount} crew teams`);
    await migrateOne(gs);
    migrated++;
  }

  console.log("\n✅ Migration complete!");
  console.log(`   Total GameStates inspected: ${total}`);
  console.log(`   Migrated:                  ${migrated}`);
  console.log(`   Skipped (already done):    ${skipped}`);

  await mongoose.disconnect();
  process.exit(0);
};

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
