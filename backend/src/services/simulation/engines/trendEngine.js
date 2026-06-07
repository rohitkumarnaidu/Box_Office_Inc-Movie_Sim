// Market Trends Engine
//
// Drives a living box-office climate. Each week:
//   - active trends age; expired ones end and put their genre on cooldown
//   - a new trend may spawn (weighted random) if below the active cap and
//     its genre is neither already trending nor on cooldown
//   - genre cooldowns tick down
//
// The engine is split into PURE functions (no DB, no Date.now, RNG injected)
// so the behaviour is fully unit-testable, plus one stateful entry point
// (processMarketTrends) that the weekly tick calls.

import { TREND_DEFINITIONS, TREND_CONFIG } from "../../../constants/marketStates.js";

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Weighted random pick from a list of trend definitions.
 * @param {Array} candidates  trend defs, each with a numeric `weight`
 * @param {() => number} rng  returns a float in [0, 1)
 * @returns {object|null} the chosen trend def, or null if no candidates
 */
export const pickWeightedTrend = (candidates, rng) => {
  if (!candidates || candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, t) => sum + (t.weight || 0), 0);
  if (totalWeight <= 0) return null;

  let roll = rng() * totalWeight;
  for (const trend of candidates) {
    roll -= trend.weight || 0;
    if (roll < 0) return trend;
  }
  // Floating-point fallback: return the last candidate.
  return candidates[candidates.length - 1];
};

/**
 * Trends eligible to spawn this week: genre not currently active and not on
 * cooldown.
 * @param {object} state        { activeTrends: [], genreCooldowns: {} }
 * @returns {Array} eligible trend definitions
 */
export const getEligibleTrends = (state) => {
  const activeGenres = new Set((state.activeTrends || []).map((t) => t.genre));
  const cooldowns = state.genreCooldowns || {};

  return TREND_DEFINITIONS.filter((def) => {
    if (activeGenres.has(def.genre)) return false;
    if ((cooldowns[def.genre] || 0) > 0) return false;
    return true;
  });
};

/**
 * Advance the market by one week. PURE: returns a new state object and the
 * messages generated; does not mutate the input.
 *
 * @param {object} state        { activeTrends: [], genreCooldowns: {} }
 * @param {number} currentWeek  the week being processed
 * @param {() => number} rng    float in [0, 1)
 * @returns {{ activeTrends: Array, genreCooldowns: object, messages: string[] }}
 */
export const advanceTrends = (state, currentWeek, rng) => {
  const messages = [];

  const prevActive = state.activeTrends || [];
  const cooldowns = { ...(state.genreCooldowns || {}) };

  // 1. Tick down existing cooldowns (floor at 0).
  for (const genre of Object.keys(cooldowns)) {
    cooldowns[genre] = Math.max(0, (cooldowns[genre] || 0) - 1);
    if (cooldowns[genre] === 0) delete cooldowns[genre];
  }

  // 2. Expire trends whose endWeek has passed; survivors stay active.
  const stillActive = [];
  for (const trend of prevActive) {
    if (currentWeek >= trend.endWeek) {
      // Trend ends -> genre goes on cooldown.
      cooldowns[trend.genre] = TREND_CONFIG.genreCooldownWeeks;
      messages.push(`The "${trend.label}" trend has faded.`);
    } else {
      stillActive.push(trend);
    }
  }

  // 3. Possibly spawn a new trend if below the cap.
  if (
    stillActive.length < TREND_CONFIG.maxActiveTrends &&
    rng() < TREND_CONFIG.spawnChancePerWeek
  ) {
    const eligible = getEligibleTrends({
      activeTrends: stillActive,
      genreCooldowns: cooldowns,
    });
    const picked = pickWeightedTrend(eligible, rng);
    if (picked) {
      const span = picked.maxWeeks - picked.minWeeks;
      const duration = picked.minWeeks + Math.floor(rng() * (span + 1));
      const newTrend = {
        id: picked.id,
        label: picked.label,
        genre: picked.genre,
        multiplier: picked.multiplier,
        startWeek: currentWeek,
        endWeek: currentWeek + duration,
      };
      stillActive.push(newTrend);
      const direction = picked.multiplier >= 1 ? "rising" : "cooling";
      messages.push(
        `Market shift: ${picked.label} — ${picked.genre} films are ${direction}. ${picked.description}`
      );
    }
  }

  return { activeTrends: stillActive, genreCooldowns: cooldowns, messages };
};

/**
 * Combined box-office multiplier for a movie given its genres and the set of
 * active trends. Multipliers for every matching active trend are compounded,
 * so a film matching two boosting trends benefits from both (and a film
 * caught in a boom + fatigue nets them out).
 *
 * @param {Array} activeTrends  active trend objects (with genre + multiplier)
 * @param {string[]} genres     the movie's genres
 * @returns {number} multiplier (neutral baseline when nothing matches)
 */
export const getGenreMultiplier = (activeTrends, genres) => {
  if (!activeTrends || activeTrends.length === 0) {
    return TREND_CONFIG.neutralMultiplier;
  }
  if (!genres || genres.length === 0) {
    return TREND_CONFIG.neutralMultiplier;
  }

  const genreSet = new Set(genres);
  let multiplier = TREND_CONFIG.neutralMultiplier;

  for (const trend of activeTrends) {
    if (genreSet.has(trend.genre)) {
      multiplier *= trend.multiplier;
    }
  }

  return multiplier;
};

// ---------------------------------------------------------------------------
// Stateful entry point (called by the weekly tick)
// ---------------------------------------------------------------------------

/**
 * Reads/writes gameState.marketTrends, advances the climate one week, and
 * returns the messages produced (so the caller can surface notifications).
 *
 * Mutates gameState in place and flags the Mixed subtree as modified so
 * Mongoose persists nested changes.
 *
 * @param {object} gameState  a GameState mongoose document (or plain object)
 * @param {() => number} [rng] injectable RNG; defaults to Math.random
 * @returns {string[]} notification messages
 */
export const processMarketTrends = (gameState, rng = Math.random) => {
  if (!gameState.marketTrends) {
    gameState.marketTrends = { activeTrends: [], genreCooldowns: {} };
  }

  const currentWeek = gameState.currentWeek || 0;

  const result = advanceTrends(
    {
      activeTrends: gameState.marketTrends.activeTrends || [],
      genreCooldowns: gameState.marketTrends.genreCooldowns || {},
    },
    currentWeek,
    rng
  );

  gameState.marketTrends.activeTrends = result.activeTrends;
  gameState.marketTrends.genreCooldowns = result.genreCooldowns;

  // genreCooldowns is a Mixed type; tell Mongoose the nested object changed.
  if (typeof gameState.markModified === "function") {
    gameState.markModified("marketTrends");
  }

  return result.messages;
};

export default processMarketTrends;
