// ---------------------------------------------------------------------------
// Rival Studio Engine
//
// Manages AI-controlled competitor studios. Each weekly tick:
//   1. generateRivalStudios()  — creates 4 rivals on first tick (once only)
//   2. processRivalStudios()   — ticks active movies, releases finished ones,
//                                optionally starts new productions
//   3. computeMarketSharePenalty() — returns a 0.6–1.0 multiplier that
//                                    the studioGrowthEngine applies to fanGain
// ---------------------------------------------------------------------------

import { addNotification } from "../helpers/notificationHelper.js";
import { VERDICTS, getVerdict } from "../../../constants/verdicts.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PERSONALITIES = ["BLOCKBUSTER", "PRESTIGE", "INDIE", "COMMERCIAL", "CHAOTIC"];

const STUDIO_NAMES = [
  "Apex Pictures",
  "Silver Screen Studios",
  "Nova Entertainment",
  "Zenith Films",
  "Eclipse Productions",
  "Titan Cinema",
  "Aurora Studios",
  "Paramount Visions",
  "Stellar Works",
  "Iron Gate Films",
];

const GENRES_BY_PERSONALITY = {
  BLOCKBUSTER: ["Action", "Sci-Fi", "Adventure", "Thriller"],
  PRESTIGE:    ["Drama", "Thriller", "Biography", "Historical"],
  INDIE:       ["Drama", "Comedy", "Romance", "Horror", "Mystery"],
  COMMERCIAL:  ["Comedy", "Romance", "Family", "Animation"],
  CHAOTIC:     ["Action", "Horror", "Sci-Fi", "Comedy", "Drama", "Romance", "Thriller"],
};

// How many weeks a rival movie spends in "production" before releasing
const PRODUCTION_WEEKS_BY_PERSONALITY = {
  BLOCKBUSTER: { min: 16, max: 24 },
  PRESTIGE:    { min: 20, max: 30 },
  INDIE:       { min: 8,  max: 16 },
  COMMERCIAL:  { min: 10, max: 18 },
  CHAOTIC:     { min: 6,  max: 26 },
};

// Chance per week each rival starts a new movie (if they have capacity)
const MOVIE_START_CHANCE = {
  BLOCKBUSTER: 0.18,
  PRESTIGE:    0.10,
  INDIE:       0.22,
  COMMERCIAL:  0.20,
  CHAOTIC:     0.25,
};

// Max simultaneous active movies per rival
const MAX_ACTIVE_MOVIES = 2;

// Budget ranges (INR) and quality modifiers per personality
const BUDGET_RANGE = {
  BLOCKBUSTER: { min: 3000000, max: 12000000 },
  PRESTIGE:    { min: 1500000, max: 5000000  },
  INDIE:       { min: 300000,  max: 1500000  },
  COMMERCIAL:  { min: 1000000, max: 6000000  },
  CHAOTIC:     { min: 200000,  max: 10000000 },
};

const QUALITY_RANGE = {
  BLOCKBUSTER: { min: 55, max: 90 },
  PRESTIGE:    { min: 65, max: 95 },
  INDIE:       { min: 45, max: 85 },
  COMMERCIAL:  { min: 40, max: 80 },
  CHAOTIC:     { min: 20, max: 95 },
};

// Movie title templates for quick generation
const TITLE_PREFIXES = [
  "The Last", "Dark", "Rising", "Eternal", "Shadow of", "Beyond the",
  "Empire of", "Dawn of", "Fury of", "Legend of", "Edge of", "Return of",
  "Fall of", "Kingdom of", "Phantom", "Secret", "Hidden", "Lost",
];
const TITLE_NOUNS = [
  "Storm", "Kingdom", "Empire", "Dawn", "Horizon", "Thunder",
  "Legacy", "Prophecy", "Destiny", "Silence", "Fire", "Star",
  "Warrior", "Ghost", "Champion", "Echo", "Sentinel", "Abyss",
  "Phoenix", "Titan", "Shadow", "Aurora", "Reckoning", "Fallen",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uid = () => Math.random().toString(36).slice(2, 10);

const generateMovieTitle = () =>
  `${pick(TITLE_PREFIXES)} ${pick(TITLE_NOUNS)}`;

// ---------------------------------------------------------------------------
// 1. Generate rival studios (called once per game)
// ---------------------------------------------------------------------------

export const generateRivalStudios = (gameState) => {
  if (gameState.rivalStudiosInitialized) return;

  const count = 4; // fixed count as per plan
  const usedNames = new Set();
  const shuffledNames = [...STUDIO_NAMES].sort(() => Math.random() - 0.5);

  const rivals = [];

  for (let i = 0; i < count; i++) {
    const personality = PERSONALITIES[i % PERSONALITIES.length];
    const name = shuffledNames.find((n) => !usedNames.has(n)) || `Rival Studio ${i + 1}`;
    usedNames.add(name);

    const moneyRange = BUDGET_RANGE[personality];
    const startMoney = rand(moneyRange.min * 2, moneyRange.max * 3);

    rivals.push({
      id: uid(),
      name,
      personality,
      money: startMoney,
      prestige: rand(0, 30),
      fans: rand(0, 50000),
      level: 1,
      activeMovies: [],
      movieHistory: [],
      stats: {
        moviesReleased: 0,
        hits: 0,
        blockbusters: 0,
        flops: 0,
        totalRevenue: 0,
        totalFansEarned: 0,
      },
    });
  }

  gameState.rivalStudios = rivals;
  gameState.rivalStudiosInitialized = true;

  // Tell Mongoose the nested array has changed
  if (typeof gameState.markModified === "function") {
    gameState.markModified("rivalStudios");
    gameState.markModified("rivalStudiosInitialized");
  }

  addNotification(
    gameState,
    `🏢 The industry is alive! ${count} rival studios have entered the market.`
  );
};

// ---------------------------------------------------------------------------
// 2. Process rivals each week
// ---------------------------------------------------------------------------

/**
 * Ticks down active movies, releases finished ones, and maybe starts new ones.
 * Returns an array of release events for the simulation summary.
 */
export const processRivalStudios = (gameState) => {
  if (!gameState.rivalStudios || gameState.rivalStudios.length === 0) return [];

  const rivalReleases = []; // { rivalName, movieTitle, verdict, boxOffice }

  for (const rival of gameState.rivalStudios) {
    // --- Tick active movies ---
    const stillActive = [];

    for (const movie of rival.activeMovies || []) {
      movie.weeksRemaining = Math.max(0, movie.weeksRemaining - 1);

      if (movie.weeksRemaining === 0) {
        // Release the movie
        const release = _releaseRivalMovie(rival, movie, gameState.currentWeek);
        rivalReleases.push({ rivalName: rival.name, ...release });

        // Notification
        const emoji =
          release.verdict === VERDICTS.BLOCKBUSTER || release.verdict === VERDICTS.ALL_TIME_BLOCKBUSTER
            ? "💥"
            : release.verdict === VERDICTS.HIT
            ? "🎉"
            : release.verdict === "FLOP" || release.verdict === "DISASTER"
            ? "💸"
            : "🎬";

        addNotification(
          gameState,
          `${emoji} ${rival.name} released "${movie.title}" (${movie.genre}) — ${release.verdict}! Box office: ₹${release.boxOffice.toLocaleString()}`
        );
      } else {
        stillActive.push(movie);
      }
    }

    rival.activeMovies = stillActive;

    // --- Maybe start a new movie ---
    if (rival.activeMovies.length < MAX_ACTIVE_MOVIES) {
      const startChance = MOVIE_START_CHANCE[rival.personality] || 0.15;
      if (Math.random() < startChance) {
        const newMovie = _startRivalMovie(rival);
        rival.activeMovies.push(newMovie);
      }
    }
  }

  // Tell Mongoose that the rivalStudios nested array has changed
  if (typeof gameState.markModified === "function") {
    gameState.markModified("rivalStudios");
  }

  return rivalReleases;
};

// ---------------------------------------------------------------------------
// Internal: release a rival movie and update rival stats
// ---------------------------------------------------------------------------

const _releaseRivalMovie = (rival, movie, currentWeek) => {
  const qualityFactor = movie.quality / 100;

  // Simplified box office: quality × budget × 2–5x multiplier + randomness
  const multiplier = 2 + qualityFactor * 3 + (Math.random() - 0.3);
  const boxOffice = Math.round(movie.budget * Math.max(0.1, multiplier));
  const profit = boxOffice - movie.budget;
  const roi = movie.budget > 0 ? profit / movie.budget : 0;
  const verdict = getVerdict(roi);

  // Fan gain: proportional to box office and quality
  const fanGain = Math.round((boxOffice / 1000) * qualityFactor);

  // Prestige gain
  const prestigeGain =
    verdict === VERDICTS.ALL_TIME_BLOCKBUSTER ? rand(25, 40) :
    verdict === VERDICTS.BLOCKBUSTER? rand(15, 25) :
    verdict === VERDICTS.HIT        ? rand(8,  15) :
    verdict === VERDICTS.AVERAGE    ? rand(2,  8)  :
    verdict === VERDICTS.FLOP       ? -rand(3, 8)  :
    -rand(8, 15); // DISASTER

  // Update rival
  rival.money = Math.max(0, rival.money + profit);
  rival.fans = (rival.fans || 0) + fanGain;
  rival.prestige = Math.max(0, (rival.prestige || 0) + prestigeGain);

  // Level up check
  const nextLevelFans = rival.level * 80000;
  if (rival.fans >= nextLevelFans) {
    rival.level = (rival.level || 1) + 1;
  }

  // Stats
  rival.stats = rival.stats || {};
  rival.stats.moviesReleased = (rival.stats.moviesReleased || 0) + 1;
  rival.stats.totalRevenue = (rival.stats.totalRevenue || 0) + boxOffice;
  rival.stats.totalFansEarned = (rival.stats.totalFansEarned || 0) + fanGain;

  if (verdict === VERDICTS.HIT)         rival.stats.hits = (rival.stats.hits || 0) + 1;
  if (verdict === VERDICTS.BLOCKBUSTER || verdict === VERDICTS.ALL_TIME_BLOCKBUSTER)
    rival.stats.blockbusters = (rival.stats.blockbusters || 0) + 1;
  if (verdict === VERDICTS.FLOP || verdict === VERDICTS.DISASTER)
    rival.stats.flops = (rival.stats.flops || 0) + 1;

  // History (cap at 20 entries)
  const historyEntry = {
    id: uid(),
    title: movie.title,
    genre: movie.genre,
    budget: movie.budget,
    boxOffice,
    profit,
    verdict,
    releaseWeek: currentWeek,
  };

  rival.movieHistory = rival.movieHistory || [];
  rival.movieHistory.push(historyEntry);
  if (rival.movieHistory.length > 20) rival.movieHistory.shift();

  return { boxOffice, profit, verdict, title: movie.title, genre: movie.genre };
};

// ---------------------------------------------------------------------------
// Internal: start a new rival movie in production
// ---------------------------------------------------------------------------

const _startRivalMovie = (rival) => {
  const personality = rival.personality || "COMMERCIAL";
  const genres = GENRES_BY_PERSONALITY[personality];
  const genre = pick(genres);

  const budgetRange = BUDGET_RANGE[personality];
  const budget = rand(budgetRange.min, budgetRange.max);

  // Richer rivals can afford slightly better quality
  const wealthBonus = Math.min(15, Math.floor((rival.money || 0) / 1000000));
  const qualityRange = QUALITY_RANGE[personality];
  const quality = Math.min(100, rand(qualityRange.min, qualityRange.max) + wealthBonus);

  const weeksRange = PRODUCTION_WEEKS_BY_PERSONALITY[personality];
  const totalWeeks = rand(weeksRange.min, weeksRange.max);

  return {
    id: uid(),
    title: generateMovieTitle(),
    genre,
    budget,
    quality,
    totalWeeks,
    weeksRemaining: totalWeeks,
  };
};

// ---------------------------------------------------------------------------
// 3. Market-share penalty
// ---------------------------------------------------------------------------

/**
 * Returns a multiplier (0.60 – 1.0) applied to the player's fan gain.
 *
 * Logic:
 *   totalMarketFans = playerFans + sum(rivalFans)
 *   playerShare     = playerFans / totalMarketFans   (0–1)
 *   pressure        = 1 – playerShare                (how much rivals own)
 *   penalty         = 1 – (pressure × PRESSURE_STRENGTH)
 *
 * When the player dominates, penalty ≈ 1.0.
 * When rivals dominate, penalty approaches MIN_MULTIPLIER (0.6).
 */
const PRESSURE_STRENGTH = 0.45;
const MIN_MULTIPLIER    = 0.60;

export const computeMarketSharePenalty = (gameState, playerFans = 0) => {
  if (!gameState.rivalStudios || gameState.rivalStudios.length === 0) return 1.0;

  const totalRivalFans = gameState.rivalStudios.reduce(
    (sum, r) => sum + (r.fans || 0),
    0
  );

  const totalMarketFans = playerFans + totalRivalFans;
  if (totalMarketFans === 0) return 1.0;

  const playerShare = playerFans / totalMarketFans;
  const pressure    = 1 - playerShare;
  const penalty     = Math.max(MIN_MULTIPLIER, 1 - pressure * PRESSURE_STRENGTH);

  return penalty;
};
