// Global Random Event Engine
//
// Each simulation week this engine may fire an occasional industry event that
// affects the studio (money / fans / prestige), then surfaces a notification
// describing exactly what happened and what changed.
//
// Design (issue #14):
//   - Data-driven: all events live in constants/eventTypes.js.
//   - Weighted + rarity-balanced: rarer events are meaningfully less likely.
//   - Cooldowns: an event that fires is locked out for cooldownWeeks so the
//     same event can't repeat back-to-back (avoids predictability).
//   - Bounded: effect magnitudes are clamped so no event is game-breaking.
//   - Backward-compatible: operates on gameState.randomEvents, which defaults
//     to empty — existing saves are unaffected and "no event" is a no-op.
//
// The core is written as PURE functions (no DB, RNG injected) so selection and
// effect application are fully unit-testable. processRandomEvents is the thin
// stateful wrapper the tick engine calls.

import { EVENT_DEFINITIONS, EVENT_CONFIG } from "../../../constants/eventTypes.js";
import { addNotification } from "../helpers/notificationHelper.js";

/**
 * Effective selection weight for an event: base weight scaled by its rarity
 * multiplier. Rarer events get a smaller effective weight.
 */
const effectiveWeight = (event) => {
  const rarityMult = EVENT_CONFIG.rarityWeightMultiplier[event.rarity] ?? 1;
  return (event.weight || 0) * rarityMult;
};

/**
 * Weighted random selection from a list of event definitions.
 * @param {Array} candidates  event defs
 * @param {() => number} rng  returns a float in [0, 1)
 * @returns {object|null} the chosen event def, or null if none.
 */
export const pickWeightedEvent = (candidates, rng) => {
  if (!candidates || candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, e) => sum + effectiveWeight(e), 0);
  if (totalWeight <= 0) return null;

  let roll = rng() * totalWeight;
  for (const event of candidates) {
    roll -= effectiveWeight(event);
    if (roll < 0) return event;
  }
  // Floating-point fallback.
  return candidates[candidates.length - 1];
};

/**
 * Events eligible to fire this week: those not currently on cooldown.
 * @param {object} cooldowns  map of eventId -> remaining cooldown weeks
 * @returns {Array} eligible event definitions
 */
export const getEligibleEvents = (cooldowns) => {
  const cd = cooldowns || {};
  return EVENT_DEFINITIONS.filter((def) => (cd[def.id] || 0) <= 0);
};

/**
 * Clamp a single effect's magnitude to the configured safety bounds so no
 * event can be game-breaking.
 * @param {object} effect  { target, type, value }
 * @returns {object} a possibly-clamped copy
 */
const clampEffect = (effect) => {
  if (effect.type === "percent") {
    const capped = Math.max(
      -EVENT_CONFIG.maxPercentMagnitude,
      Math.min(EVENT_CONFIG.maxPercentMagnitude, effect.value)
    );
    return { ...effect, value: capped };
  }
  // flat
  const capped = Math.max(
    -EVENT_CONFIG.maxFlatMagnitude,
    Math.min(EVENT_CONFIG.maxFlatMagnitude, effect.value)
  );
  return { ...effect, value: capped };
};

/**
 * Apply an event's effects to a snapshot of studio stats. PURE: takes and
 * returns plain numbers, does not touch the DB. Studio stats have a floor of 0
 * (mirrors the Studio schema min:0 on money/fans/prestige).
 *
 * @param {object} stats  { money, fans, prestige }
 * @param {object} event  an event definition
 * @returns {{ stats: object, changes: Array }} new stats + per-effect change log
 */
export const applyEventEffects = (stats, event) => {
  const next = {
    money: Number(stats.money || 0),
    fans: Number(stats.fans || 0),
    prestige: Number(stats.prestige || 0),
  };
  const changes = [];

  for (const rawEffect of event.effects || []) {
    const effect = clampEffect(rawEffect);
    const target = effect.target;
    if (next[target] === undefined) continue; // ignore unknown targets safely

    const before = next[target];
    let delta;
    if (effect.type === "percent") {
      delta = Math.round((before * effect.value) / 100);
    } else {
      delta = Math.round(effect.value);
    }

    next[target] = Math.max(0, before + delta);
    // Record the ACTUAL applied delta (after the 0-floor), so notifications
    // never overstate a loss that was clamped by the floor.
    const appliedDelta = next[target] - before;
    changes.push({ target, delta: appliedDelta });
  }

  return { stats: next, changes };
};

/**
 * Build a human-readable summary of stat changes for the notification.
 * e.g. "+8,000 fans, -₹500,000".
 */
const describeChanges = (changes) => {
  if (!changes || changes.length === 0) return "No measurable impact.";
  const parts = changes.map(({ target, delta }) => {
    const sign = delta >= 0 ? "+" : "-";
    const magnitude = Math.abs(delta).toLocaleString();
    if (target === "money") return `${sign}₹${magnitude}`;
    return `${sign}${magnitude} ${target}`;
  });
  return parts.join(", ") + ".";
};

/**
 * Pure weekly roll. Decides whether an event fires and which one, applies its
 * effects to the provided stat snapshot, and returns the new stats, the fired
 * events (with messages), and the updated cooldown map. No mutation of inputs.
 *
 * @param {object} state  { cooldowns: {...} }
 * @param {object} stats  { money, fans, prestige }
 * @param {() => number} rng
 * @returns {{ stats, cooldowns, fired: Array }}
 */
export const rollEvents = (state, stats, rng) => {
  // 1. Tick down cooldowns (floor at 0, drop zeroed entries).
  const cooldowns = { ...(state.cooldowns || {}) };
  for (const id of Object.keys(cooldowns)) {
    cooldowns[id] = Math.max(0, (cooldowns[id] || 0) - 1);
    if (cooldowns[id] === 0) delete cooldowns[id];
  }

  let currentStats = { ...stats };
  const fired = [];

  // 2. Up to maxEventsPerTick, gate each attempt on baseTriggerChance.
  for (let i = 0; i < EVENT_CONFIG.maxEventsPerTick; i += 1) {
    if (rng() >= EVENT_CONFIG.baseTriggerChance) break;

    const eligible = getEligibleEvents(cooldowns);
    const chosen = pickWeightedEvent(eligible, rng);
    if (!chosen) break;

    const { stats: newStats, changes } = applyEventEffects(currentStats, chosen);
    currentStats = newStats;
    cooldowns[chosen.id] = chosen.cooldownWeeks || 0;

    const summary = describeChanges(changes);
    const message = (chosen.message || "{effects}").replace("{effects}", summary);
    fired.push({ id: chosen.id, label: chosen.label, category: chosen.category, message, changes });
  }

  return { stats: currentStats, cooldowns, fired };
};

/**
 * Stateful entry point for the tick engine. Reads/writes gameState.randomEvents
 * and the studio's money/fans/prestige, applies any fired event, and pushes
 * notifications. Returns the list of fired events (for summaries/tests).
 *
 * @param {object} gameState  GameState document (or plain object)
 * @param {object} studio     Studio document (or plain object)
 * @param {() => number} [rng] injectable RNG; defaults to Math.random
 * @returns {Array} fired events
 */
export const processRandomEvents = (gameState, studio, rng = Math.random) => {
  if (!gameState.randomEvents) {
    gameState.randomEvents = { cooldowns: {}, history: [] };
  }

  const result = rollEvents(
    { cooldowns: gameState.randomEvents.cooldowns || {} },
    {
      money: studio?.money || 0,
      fans: studio?.fans || 0,
      prestige: studio?.prestige || 0,
    },
    rng
  );

  // Write back studio stats (only if a studio was provided).
  if (studio) {
    studio.money = result.stats.money;
    studio.fans = result.stats.fans;
    studio.prestige = result.stats.prestige;
  }

  // Persist cooldowns + a capped rolling history.
  gameState.randomEvents.cooldowns = result.cooldowns;
  const history = Array.isArray(gameState.randomEvents.history)
    ? gameState.randomEvents.history
    : [];
  for (const ev of result.fired) {
    history.push({ id: ev.id, label: ev.label, week: gameState.currentWeek || 0 });
    addNotification(gameState, `Industry Event — ${ev.label}: ${ev.message}`);
  }
  // Keep the last 50 events only.
  gameState.randomEvents.history = history.slice(-50);

  // randomEvents is a Mixed subtree; flag it so Mongoose persists nested writes.
  if (typeof gameState.markModified === "function") {
    gameState.markModified("randomEvents");
  }

  return result.fired;
};

// ---------------------------------------------------------------------------
// Production Events — movie-level crises & opportunities
// ---------------------------------------------------------------------------

import { PRODUCTION_EVENT_DEFINITIONS } from "../../../constants/eventTypes.js";

/**
 * Processes production events for all active movies currently in production
 * (PRE_PRODUCTION, PRODUCTION, POST_PRODUCTION).
 *
 * Each event has an independent probability of firing per movie per tick.
 * At most one production event fires per movie per tick to avoid pile-ups.
 *
 * Effects:
 * - `delayWeeks` → added to movie.delayWeeks (pauses progress in productionEngine)
 * - `qualityDelta` → adjusts movie.quality
 * - `hypeDelta` → adjusts movie.hype
 * - `budgetCost` → deducted from studio.money (negative = money gained)
 * - Event is logged to `movie.events[]` and a notification is sent.
 *
 * @async
 * @param {object} gameState - GameState document.
 * @param {object} studio - Studio document.
 * @param {() => number} [rng=Math.random] - RNG for testability.
 * @returns {Promise<void>}
 */
export const processProductionEvents = async (gameState, studio, rng = Math.random) => {
  if (!gameState.activeMovies || gameState.activeMovies.length === 0) return;

  // Dynamic import to avoid mongoose dependency at module load (keeps pure functions testable)
  const { default: Movie } = await import("../../../models/Movie.js");

  const productionStatuses = ["PRE_PRODUCTION", "PRODUCTION", "POST_PRODUCTION"];
  const movies = await Movie.find({
    _id: { $in: gameState.activeMovies },
    status: { $in: productionStatuses },
  });

  for (const movie of movies) {
    // At most one event per movie per tick
    let eventFired = false;

    for (const eventDef of PRODUCTION_EVENT_DEFINITIONS) {
      if (eventFired) break;
      if (rng() >= eventDef.chance) continue;

      eventFired = true;

      // Apply delay
      if (eventDef.delayWeeks > 0) {
        movie.delayWeeks = (movie.delayWeeks || 0) + eventDef.delayWeeks;
        movie.remainingWeeks = (movie.remainingWeeks || 0) + eventDef.delayWeeks;
      }

      // Adjust quality and hype (clamped 0-100)
      if (eventDef.qualityDelta) {
        movie.quality = Math.max(0, Math.min(100, (movie.quality || 0) + eventDef.qualityDelta));
      }
      if (eventDef.hypeDelta) {
        movie.hype = Math.max(0, Math.min(100, (movie.hype || 0) + eventDef.hypeDelta));
      }

      // Budget cost (positive = expense, negative = savings)
      if (eventDef.budgetCost && studio) {
        studio.money = Math.max(0, (studio.money || 0) - eventDef.budgetCost);
      }

      // Log the event on the movie
      if (!movie.events) movie.events = [];
      movie.events.push({
        eventId: eventDef.id,
        label: eventDef.label,
        message: eventDef.message,
        week: gameState.currentWeek || 0,
      });

      // Notification
      addNotification(
        gameState,
        `🎬 "${movie.title}" — ${eventDef.label}: ${eventDef.message}`
      );

      await movie.save();
    }
  }
};

export default processRandomEvents;
