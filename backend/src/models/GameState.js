import mongoose from "mongoose";

const gameStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    currentWeek: {
      type: Number,
      default: 1,
    },

    ownedScripts: [
      {
        title: String,

        genres: [String],

        quality: Number,

        originality: Number,

        audienceAppeal: Number,

        franchisePotential: Number,

        rarity: String,

        price: Number,

        sellPrice: Number,

        purchasedAt: Date,
      },
    ],

    marketScripts: [
      {
        title: String,

        genres: [String],

        quality: Number,

        originality: Number,

        audienceAppeal: Number,

        franchisePotential: Number,

        rarity: String,

        price: Number,
      },
    ],

    activeMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],

    marketWriters: [
      {
        id: String,

        name: String,

        avatarSeed: String,

        age: Number,

        originality: Number,

        consistency: Number,

        reliability: Number,

        reputation: Number,

        morale: Number,

        salary: Number,

        rarity: String,

        genreExpertise: [String],

        status: {
          type: String,
          default: "AVAILABLE",
        },

        busyUntilWeek: Number,

        contractYears: Number,

        writtenScripts: {
          type: Number,
          default: 0,
        },

        hitScripts: {
          type: Number,
          default: 0,
        },

        discovered: {
          type: Number,
          default: 0,
        },
      },
    ],

    ownedWriters: [
      {
        id: String,

        name: String,

        avatarSeed: String,

        age: Number,

        originality: Number,

        consistency: Number,

        reliability: Number,

        reputation: Number,

        morale: Number,

        salary: Number,

        rarity: String,

        genreExpertise: [String],

        status: {
          type: String,
          default: "AVAILABLE",
        },

        busyUntilWeek: Number,

        contractYears: Number,

        writtenScripts: {
          type: Number,
          default: 0,
        },

        hitScripts: {
          type: Number,
          default: 0,
        },

        discovered: {
          type: Number,
          default: 0,
        },

        hiredAt: Date,
      },
    ],

    activeWritingProjects: [
      {
        id: String,

        writerId: String,

        writerName: String,

        genre: String,

        targetAudience: String,

        startWeek: Number,

        completionWeek: Number,

        progress: Number,

        qualityPenalty: {
          type: Number,
          default: 0,
        },

        replacementRequired: {
          type: Boolean,
          default: false,
        },

        status: {
          type: String,
          default: "WRITING",
        },
      },
    ],

    notifications: [
      {
        type: {
          type: String,
          default: "SYSTEM",
        },

        message: {
          type: String,
          required: true,
        },

        read: {
          type: Boolean,
          default: false,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const GameState = mongoose.model("GameState", gameStateSchema);

export default GameState;
