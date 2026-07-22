/**
 * @fileoverview Talent Contract Mongoose Schema Model
 */

import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    talentId: {
      type: String,
      required: true,
    },
    talentName: {
      type: String,
      required: true,
    },
    talentRole: {
      type: String,
      enum: ["ACTOR", "DIRECTOR", "WRITER"],
      default: "ACTOR",
    },
    upfrontFee: {
      type: Number,
      required: true,
      min: 0,
    },
    backendRoyaltyPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 25,
    },
    exclusivityWeeks: {
      type: Number,
      default: 12,
      min: 1,
    },
    status: {
      type: String,
      enum: ["PROPOSED", "ACCEPTED", "REJECTED", "EXPIRED", "TERMINATED"],
      default: "PROPOSED",
    },
    buyoutPenalty: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Contract = mongoose.models.Contract || mongoose.model("Contract", contractSchema);

export default Contract;
