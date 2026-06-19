import mongoose from "mongoose";
import { VERDICT_LIST } from "../constants/verdicts.js";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    studioId: { type: mongoose.Schema.Types.ObjectId, ref: "Studio", required: true },
    scriptId: { type: String, required: true },
    directorId: { type: String, required: true },
    directorName: { type: String, default: "" },
    leadActorId: { type: String, required: true },
    leadActorName: { type: String, default: "" },
    supportingActorIds: [{ type: String }],
    crewTeamId: { type: String, required: true },
    crewTeamName: { type: String, default: "" },

    budget: { type: Number, default: 0 },
    marketingBudget: { type: Number, default: 0 },
    marketingCampaigns: [{ type: String }],

    quality: { type: Number, default: 0 },
    hype: { type: Number, default: 0 },

    criticScore: { type: Number, default: 0 },
    criticLabel: { type: String, default: "" },
    audienceScore: { type: Number, default: 0 },
    audienceLabel: { type: String, default: "" },

    boxOffice: { type: Number, default: 0 }, // Worldwide Gross
    openingWeekend: { type: Number, default: 0 },
    domesticGross: { type: Number, default: 0 },
    internationalGross: { type: Number, default: 0 },
    worldwideGross: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },
    verdict: { type: String, enum: [...VERDICT_LIST, "N/A"], default: "N/A" },

    status: {
      type: String,
      enum: ["PLANNING", "PRE_PRODUCTION", "PRODUCTION", "POST_PRODUCTION", "READY_FOR_RELEASE", "RELEASED"],
      default: "PLANNING",
    },

    createdWeek: { type: Number, required: true },
    releaseWeek: { type: Number, default: null },
    productionProgress: { type: Number, default: 0 },
    remainingWeeks: { type: Number, default: 0 },

    budgetBreakdown: {
        scriptCost: { type: Number, default: 0 },
        directorCost: { type: Number, default: 0 },
        leadActorCost: { type: Number, default: 0 },
        supportingActorCost: { type: Number, default: 0 },
        crewCost: { type: Number, default: 0 },
        marketingCost: { type: Number, default: 0 },
    },

    // Track weeks in each stage
    weeksInStage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
