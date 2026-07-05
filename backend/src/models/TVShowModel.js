import mongoose from "mongoose";

const tvShowSchema = new mongoose.Schema(
  {
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studio",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    genre: {
      type: String,
      default: "Drama",
      trim: true,
    },

    seasons: {
      type: Number,
      default: 1,
      min: 1,
    },

    episodesPerSeason: {
      type: Number,
      default: 8,
      min: 1,
    },

    budget: {
      type: Number,
      default: 0,
      min: 0,
    },

    quality: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    popularity: {
      type: Number,
      default: 0,
      min: 0,
    },

    platformId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["IN_PRODUCTION", "AIRING", "ENDED", "CANCELLED"],
      default: "IN_PRODUCTION",
    },

    createdWeek: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TVShow = mongoose.model("TVShow", tvShowSchema);

export default TVShow;
