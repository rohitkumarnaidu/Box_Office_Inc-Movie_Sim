/**
 * @fileoverview Franchise Ecosystem & Shared Universe Mongoose Schema Model
 */

import mongoose from "mongoose";

const franchiseEcosystemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    universeName: {
      type: String,
      required: true,
      trim: true,
    },
    connectedMovieIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    loreConsistencyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    universeHypeMultiplier: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.5,
    },
    fatigueDecayFactor: {
      type: Number,
      default: 0.05,
      min: 0.01,
      max: 0.30,
    },
    totalUniverseGross: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const FranchiseEcosystem = mongoose.models.FranchiseEcosystem || mongoose.model("FranchiseEcosystem", franchiseEcosystemSchema);

export default FranchiseEcosystem;
