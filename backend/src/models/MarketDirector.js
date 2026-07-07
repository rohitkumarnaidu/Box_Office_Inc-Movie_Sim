import mongoose from "mongoose";

/**
 * @fileoverview MarketDirector Model
 *
 * Stores directors available in the public market pool, separated from
 * GameState to prevent unbounded document growth (issue #188).
 *
 * Each document represents one market director tied to a specific user's
 * game instance. The userId + id compound index enables fast lookups
 * by both the game owner and the director's unique game-generated ID.
 */

const marketDirectorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    id: { type: String, required: true },

    name: { type: String },

    avatarSeed: { type: String },

    age: { type: Number },

    creativity: { type: Number },

    reliability: { type: Number },

    leadership: { type: Number },

    reputation: { type: Number },

    morale: { type: Number },

    salary: { type: Number },

    marketValue: { type: Number, default: 0 },

    rarity: { type: String },

    genreExpertise: [String],

    status: { type: String, default: "AVAILABLE" },

    busyUntilWeek: { type: Number, default: null },

    contractYears: { type: Number },

    moviesDirected: { type: Number, default: 0 },

    hitMovies: { type: Number, default: 0 },

    flopMovies: { type: Number, default: 0 },

    awards: { type: Number, default: 0 },

    totalEarnings: { type: Number, default: 0 },

    studiosWorkedWith: [String],

    ratings: [Number],

    discovered: { type: Number, default: 0 },

    hiredAt: { type: Date, default: null },

    // Retired directors tracked in this collection get archived here
    retiredAtWeek: { type: Number, default: null },
    retiredFrom: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound index for market queries filtered by game + status
marketDirectorSchema.index({ userId: 1, status: 1 });

// Lookup index for simulation engines that reference by game-generated id
marketDirectorSchema.index({ id: 1, userId: 1 });

const MarketDirector = mongoose.model("MarketDirector", marketDirectorSchema);

export default MarketDirector;
