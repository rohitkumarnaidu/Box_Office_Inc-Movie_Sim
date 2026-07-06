import mongoose from "mongoose";

/**
 * @fileoverview Relationship Model
 *
 * Tracks chemistry scores between pairs of creative talent (actors, directors,
 * writers). Chemistry affects movie quality when both talents work together.
 *
 * Chemistry range: -100 (toxic) to +100 (legendary partnership).
 */
const relationshipSchema = new mongoose.Schema(
  {
    gameStateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameState",
      required: true,
      index: true,
    },
    talentId1: { type: String, required: true },
    talentId2: { type: String, required: true },
    talentType1: { type: String, enum: ["ACTOR", "DIRECTOR", "WRITER"], required: true },
    talentType2: { type: String, enum: ["ACTOR", "DIRECTOR", "WRITER"], required: true },

    // Chemistry score: -100 to +100. Starts at 0 (neutral).
    chemistry: { type: Number, default: 0, min: -100, max: 100 },

    // How many movies they have worked on together
    collaborations: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index: ensure each pair is unique per game state
relationshipSchema.index({ gameStateId: 1, talentId1: 1, talentId2: 1 }, { unique: true });

const Relationship = mongoose.model("Relationship", relationshipSchema);

export default Relationship;
