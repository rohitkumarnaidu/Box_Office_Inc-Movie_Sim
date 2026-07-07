import mongoose from "mongoose";

/**
 * @fileoverview MarketActor Model
 *
 * Stores actors available in the public market pool, separated from
 * GameState to prevent unbounded document growth (issue #188).
 *
 * Each document represents one market actor tied to a specific user's
 * game instance. The userId + id compound index enables fast lookups
 * by both the game owner and the actor's unique game-generated ID.
 */

const marketActorSchema = new mongoose.Schema(
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

    popularity: { type: Number },

    actingSkill: { type: Number },

    reliability: { type: Number },

    fanbase: { type: Number },

    morale: { type: Number },

    salary: { type: Number },

    rarity: { type: String },

    hiddenPotential: { type: Number },

    status: { type: String, default: "AVAILABLE" },

    busyUntilWeek: { type: Number, default: null },

    contractYears: { type: Number },

    movies: { type: Number, default: 0 },

    leadRoles: { type: Number, default: 0 },

    supportingRoles: { type: Number, default: 0 },

    hitMovies: { type: Number, default: 0 },

    flopMovies: { type: Number, default: 0 },

    awards: { type: Number, default: 0 },

    boxOfficeTotal: { type: Number, default: 0 },

    careerEarnings: { type: Number, default: 0 },

    salaryHistory: [
      {
        week: Number,
        salary: Number,
        reason: String,
      },
    ],

    careerHistory: [mongoose.Schema.Types.Mixed],

    studiosWorkedWith: [String],

    discovered: { type: Number, default: 0 },

    hiredAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound index for market queries filtered by game + status
marketActorSchema.index({ userId: 1, status: 1 });

// Lookup index for simulation engines that reference by game-generated id
marketActorSchema.index({ id: 1, userId: 1 });

const MarketActor = mongoose.model("MarketActor", marketActorSchema);

export default MarketActor;
