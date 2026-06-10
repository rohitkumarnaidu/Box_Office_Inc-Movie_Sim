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

    // Global Random Event Engine state. Tracks per-event cooldowns and a
    // rolling history of fired events. Mixed because event-id keys are
    // dynamic; the engine reads/writes it as a plain object. Optional with a
    // sensible default so pre-existing saves load unchanged.
    randomEvents: {
      cooldowns: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      history: [
        {
          id: String,
          label: String,
          week: Number,
        },
      ],
    },

    ownedScripts: [
      {
        id: String,

        title: String,

        genres: [String],

        quality: Number,

        originality: Number,

        audienceAppeal: Number,

        franchisePotential: Number,

        rarity: String,

        price: Number,

        sellPrice: Number,

        writer: String,

        writerId: String,

        studio: String,

        studioId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Studio",
        },

        creationDate: Date,

        purchasedAt: Date,

        status: {
          type: String,
          enum: ["AVAILABLE", "IN_DIRECTING", "PRE_PRODUCTION_READY", "SOLD"],
          default: "AVAILABLE",
        },

        assignedDirectorId: String,

        assignedDirectorName: String,

        directingProjectId: String,
      },
    ],

    marketScripts: [
      {
        id: String,

        title: String,

        genres: [String],

        quality: Number,

        originality: Number,

        audienceAppeal: Number,

        franchisePotential: Number,

        rarity: String,

        price: Number,

        writer: String,

        writerId: String,

        studio: String,

        studioId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Studio",
        },

        creationDate: Date,

        status: {
          type: String,
          enum: ["AVAILABLE", "IN_DIRECTING", "PRE_PRODUCTION_READY", "SOLD"],
          default: "AVAILABLE",
        },

        assignedDirectorId: String,

        assignedDirectorName: String,

        directingProjectId: String,
      },
    ],

    activeMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],

    movieHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],

    preProductionMovies: [
      {
        id: String,

        title: String,

        scriptId: String,

        scriptTitle: String,

        directorId: String,

        directorName: String,

        genre: String,

        projectedQuality: Number,

        stage: {
          type: String,
          default: "PRE_PRODUCTION_READY",
        },
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

        flopScripts: {
          type: Number,
          default: 0,
        },

        awards: {
          type: Number,
          default: 0,
        },

        awardsHistory: [
          {
            awardName: String,
            scriptName: String,
            week: Number,
            genre: String,
            reputationGain: Number,
            skillBoosts: {
              originality: Number,
              consistency: Number,
              reliability: Number,
            },
          },
        ],

        totalEarnings: {
          type: Number,
          default: 0,
        },

        salaryHistory: [
          {
            week: Number,
            salary: Number,
            reason: String,
          },
        ],

        careerHistory: [
          {
            scriptName: String,
            studioName: String,
            completionWeek: Number,
            genre: String,
            scriptQuality: Number,
          },
        ],

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

        flopScripts: {
          type: Number,
          default: 0,
        },

        awards: {
          type: Number,
          default: 0,
        },

        awardsHistory: [
          {
            awardName: String,
            scriptName: String,
            week: Number,
            genre: String,
            reputationGain: Number,
            skillBoosts: {
              originality: Number,
              consistency: Number,
              reliability: Number,
            },
          },
        ],

        totalEarnings: {
          type: Number,
          default: 0,
        },

        salaryHistory: [
          {
            week: Number,
            salary: Number,
            reason: String,
          },
        ],

        careerHistory: [
          {
            scriptName: String,
            studioName: String,
            completionWeek: Number,
            genre: String,
            scriptQuality: Number,
          },
        ],

        discovered: {
          type: Number,
          default: 0,
        },

        hiredAt: Date,
      },
    ],

    marketDirectors: [
      {
        id: String,

        name: String,

        avatarSeed: String,

        age: Number,

        creativity: Number,

        reliability: Number,

        leadership: Number,

        reputation: Number,

        morale: Number,

        salary: Number,

        marketValue: {
          type: Number,
          default: 0,
        },

        rarity: String,

        genreExpertise: [String],

        status: {
          type: String,
          default: "AVAILABLE",
        },

        busyUntilWeek: Number,

        contractYears: Number,

        moviesDirected: {
          type: Number,
          default: 0,
        },

        hitMovies: {
          type: Number,
          default: 0,
        },

        flopMovies: {
          type: Number,
          default: 0,
        },

        awards: {
          type: Number,
          default: 0,
        },

        awardsHistory: [
          {
            awardName: String,
            category: String,
            movieId: String,
            movieTitle: String,
            movieName: String,
            year: Number,
            week: Number,
            genre: String,
            rating: Number,
            prestigeValue: Number,
            reputationGain: Number,
            skillBoosts: {
              creativity: Number,
              reliability: Number,
              leadership: Number,
            },
          },
        ],

        totalEarnings: {
          type: Number,
          default: 0,
        },

        salaryHistory: [
          {
            week: Number,
            salary: Number,
            reason: String,
          },
        ],

        careerHistory: [
          {
            movieName: String,
            studioName: String,
            releaseWeek: Number,
            genre: String,
            movieRating: Number,
            boxOffice: Number,
            outcome: String,
          },
        ],

        studiosWorkedWith: [String],

        ratings: [Number],

        discovered: {
          type: Number,
          default: 0,
        },
      },
    ],

    ownedDirectors: [
      {
        id: String,

        name: String,

        avatarSeed: String,

        age: Number,

        creativity: Number,

        reliability: Number,

        leadership: Number,

        reputation: Number,

        morale: Number,

        salary: Number,

        marketValue: {
          type: Number,
          default: 0,
        },

        rarity: String,

        genreExpertise: [String],

        status: {
          type: String,
          default: "AVAILABLE",
        },

        busyUntilWeek: Number,

        contractYears: Number,

        moviesDirected: {
          type: Number,
          default: 0,
        },

        hitMovies: {
          type: Number,
          default: 0,
        },

        flopMovies: {
          type: Number,
          default: 0,
        },

        awards: {
          type: Number,
          default: 0,
        },

        awardsHistory: [
          {
            awardName: String,
            category: String,
            movieId: String,
            movieTitle: String,
            movieName: String,
            year: Number,
            week: Number,
            genre: String,
            rating: Number,
            prestigeValue: Number,
            reputationGain: Number,
            skillBoosts: {
              creativity: Number,
              reliability: Number,
              leadership: Number,
            },
          },
        ],

        totalEarnings: {
          type: Number,
          default: 0,
        },

        salaryHistory: [
          {
            week: Number,
            salary: Number,
            reason: String,
          },
        ],

        careerHistory: [
          {
            movieName: String,
            studioName: String,
            releaseWeek: Number,
            genre: String,
            movieRating: Number,
            boxOffice: Number,
            outcome: String,
          },
        ],

        studiosWorkedWith: [String],

        ratings: [Number],

        discovered: {
          type: Number,
          default: 0,
        },

        hiredAt: Date,
      },
    ],


    marketActors: [
      {
        id: String,

        name: String,

        avatarSeed: String,

        age: Number,

        popularity: Number,

        actingSkill: Number,

        reliability: Number,

        fanbase: Number,

        morale: Number,

        salary: Number,

        rarity: String,

        hiddenPotential: Number,

        status: {
          type: String,
          default: "AVAILABLE",
        },

        busyUntilWeek: Number,

        contractYears: Number,

        movies: {
          type: Number,
          default: 0,
        },

        leadRoles: {
          type: Number,
          default: 0,
        },

        supportingRoles: {
          type: Number,
          default: 0,
        },

        hitMovies: {
          type: Number,
          default: 0,
        },

        flopMovies: {
          type: Number,
          default: 0,
        },

        awards: {
          type: Number,
          default: 0,
        },

        boxOfficeTotal: {
          type: Number,
          default: 0,
        },

        careerEarnings: {
          type: Number,
          default: 0,
        },

        salaryHistory: [
          {
            week: Number,
            salary: Number,
            reason: String,
          },
        ],

        careerHistory: [
          {
            movieId: String,
            movieTitle: String,
            studioName: String,
            roleType: String,
            genre: String,
            completionWeek: Number,
            actorRating: Number,
            boxOffice: Number,
            verdict: String,
          },
        ],

        studiosWorkedWith: [String],

        discovered: {
          type: Number,
          default: 0,
        },

        hiredAt: Date,
      },
    ],

    ownedActors: [
      {
        id: String,

        name: String,

        avatarSeed: String,

        age: Number,

        popularity: Number,

        actingSkill: Number,

        reliability: Number,

        fanbase: Number,

        morale: Number,

        salary: Number,

        rarity: String,

        hiddenPotential: Number,

        status: {
          type: String,
          default: "AVAILABLE",
        },

        busyUntilWeek: Number,

        contractYears: Number,

        movies: {
          type: Number,
          default: 0,
        },

        leadRoles: {
          type: Number,
          default: 0,
        },

        supportingRoles: {
          type: Number,
          default: 0,
        },

        hitMovies: {
          type: Number,
          default: 0,
        },

        flopMovies: {
          type: Number,
          default: 0,
        },

        awards: {
          type: Number,
          default: 0,
        },

        boxOfficeTotal: {
          type: Number,
          default: 0,
        },

        careerEarnings: {
          type: Number,
          default: 0,
        },

        salaryHistory: [
          {
            week: Number,
            salary: Number,
            reason: String,
          },
        ],

        careerHistory: [
          {
            movieId: String,
            movieTitle: String,
            studioName: String,
            roleType: String,
            genre: String,
            completionWeek: Number,
            actorRating: Number,
            boxOffice: Number,
            verdict: String,
          },
        ],

        studiosWorkedWith: [String],

        discovered: {
          type: Number,
          default: 0,
        },

        hiredAt: Date,
      },
    ],

    marketCrewTeams: [
      {
        id: String,
        name: String,
        technicalQuality: Number,
        musicQuality: Number,
        vfxQuality: Number,
        creativity: Number,
        reliability: Number,
        reputation: Number,
        morale: Number,
        salary: Number,
        rarity: String,
        age: Number,
        discovery: Number,
        status: {
          type: String,
          enum: ["AVAILABLE", "BUSY"],
          default: "AVAILABLE",
        },
        busyUntilWeek: Number,
        hiredAt: Date,
        contractYears: Number,
      },
    ],

    ownedCrewTeams: [
      {
        id: String,
        name: String,
        technicalQuality: Number,
        musicQuality: Number,
        vfxQuality: Number,
        creativity: Number,
        reliability: Number,
        reputation: Number,
        morale: Number,
        salary: Number,
        rarity: String,
        age: Number,
        discovery: Number,
        status: {
          type: String,
          enum: ["AVAILABLE", "BUSY"],
          default: "AVAILABLE",
        },
        busyUntilWeek: Number,
        hiredAt: Date,
        contractYears: Number,
      },
    ],

    retiredActors: [mongoose.Schema.Types.Mixed],

    actorAwardYearsProcessed: [Number],

    retiredDirectors: [mongoose.Schema.Types.Mixed],

    directorAwardYearsProcessed: [Number],

    activeDirectorProjects: [
      {
        id: String,

        directorId: String,

        directorName: String,

        scriptId: String,

        scriptTitle: String,

        scriptQuality: Number,

        movieName: String,

        genre: String,

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
          default: "DIRECTING",
        },
      },
    ],


    activeActorProjects: [
      {
        id: String,

        actorId: String,

        actorName: String,

        movieId: String,

        movieTitle: String,

        roleType: String,

        startWeek: Number,

        completionWeek: Number,

        progress: Number,

        performanceScore: Number,

        qualityImpact: Number,

        replacementRequired: {
          type: Boolean,
          default: false,
        },

        status: {
          type: String,
          default: "ACTING",
        },
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

    // Market Trends Engine state. Tracks the active box-office climate.
    marketTrends: {
      activeTrends: [
        {
          id: String,
          label: String,
          genre: String,
          multiplier: Number,
          startWeek: Number,
          endWeek: Number,
        },
      ],
      // genre -> remaining cooldown weeks. Mixed because keys are dynamic
      // genre names; the engine reads/writes it as a plain object.
      genreCooldowns: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
);

const GameState = mongoose.model("GameState", gameStateSchema);

export default GameState;
