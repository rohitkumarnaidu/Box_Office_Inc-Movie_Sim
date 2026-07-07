import mongoose from "mongoose";

/**
 * @fileoverview MarketCrewTeam Model
 *
 * Stores crew teams available in the public market pool, separated from
 * GameState to prevent unbounded document growth (issue #188).
 *
 * Each document represents one market crew team tied to a specific user's
 * game instance. The userId + id compound index enables fast lookups
 * by both the game owner and the crew team's unique game-generated ID.
 */

const marketCrewTeamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    id: { type: String, required: true },

    name: { type: String },

    technicalQuality: { type: Number },

    musicQuality: { type: Number },

    vfxQuality: { type: Number },

    creativity: { type: Number },

    reliability: { type: Number },

    reputation: { type: Number },

    morale: { type: Number },

    salary: { type: Number },

    rarity: { type: String },

    age: { type: Number },

    discovery: { type: Number },

    status: {
      type: String,
      enum: ["AVAILABLE", "BUSY"],
      default: "AVAILABLE",
    },

    busyUntilWeek: { type: Number, default: null },

    hiredAt: { type: Date, default: null },

    contractYears: { type: Number },

    careerTier: { type: String, default: "Rookie" },
  },
  {
    timestamps: true,
  }
);

// Compound index for market queries filtered by game + status
marketCrewTeamSchema.index({ userId: 1, status: 1 });

// Lookup index for simulation engines that reference by game-generated id
marketCrewTeamSchema.index({ id: 1, userId: 1 });

const MarketCrewTeam = mongoose.model("MarketCrewTeam", marketCrewTeamSchema);

export default MarketCrewTeam;
