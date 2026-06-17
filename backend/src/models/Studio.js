import mongoose from "mongoose";

const studioSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    money: {
      type: Number,
      default: 10000000,
      min: 0,
    },

    prestige: {
      type: Number,
      default: 0,
      min: 0,
    },

    fans: {
      type: Number,
      default: 0,
      min: 0,
    },

    studioLevel: {
      type: Number,
      default: 1,
      min: 1,
    },

    highestGrossingMovie: {
        id: String,
        title: String,
        amount: Number
    },
    mostProfitableMovie: {
        id: String,
        title: String,
        amount: Number
    },
    bestReviewedMovie: {
        id: String,
        title: String,
        amount: Number
    },

    stats: {
        moviesReleased: { type: Number, default: 0 },
        hits: { type: Number, default: 0 },
        blockbusters: { type: Number, default: 0 },
        allTimeBlockbusters: { type: Number, default: 0 },
        flops: { type: Number, default: 0 },
        disasters: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        totalProfit: { type: Number, default: 0 },
        avgCriticScore: { type: Number, default: 0 },
        avgAudienceScore: { type: Number, default: 0 }
    },

    financialHistory: [{
        week: Number,
        year: Number,
        revenue: Number,
        expenses: Number,
        payroll: Number,
        movieCosts: Number,
        marketingCosts: Number,
        profit: Number,
        balance: Number
    }],
  },
  {
    timestamps: true,
  }
);

const Studio = mongoose.model("Studio", studioSchema);

export default Studio;
