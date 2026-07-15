/**
 * @fileoverview Franchise progression helpers (pure).
 *
 * Activates the franchise gameplay layer on top of the existing franchise
 * infrastructure (model / controller / routes already exist). These helpers are
 * PURE — no database access, no mutation — so the controller can read a
 * franchise's stored reputation, feed it into studio growth, then compute the
 * franchise's new reputation after a release.
 *
 * Two complementary, success-based mechanics — deliberately distinct from the
 * existing sequelNumber LENGTH-based bonuses in boxOfficeEngine/studioGrowthEngine:
 *   - fanbaseMultiplier: a loyal shared fanbase that grows from SUCCESSFUL
 *     installments and decays from failures. Applied to studio FAN gain.
 *   - prestigeBonus: franchise prestige that accrues from the long-term critical
 *     success of installments. Applied (modestly) to studio prestige.
 */

import { VERDICTS } from "../../../constants/verdicts.js";

// Conservative tunables so franchise films are rewarded for sustained success
// without dwarfing the existing sequelNumber bonuses.
export const FRANCHISE_FANBASE_MIN = 1.0;
export const FRANCHISE_FANBASE_MAX = 1.5; // ~10 hits to reach the cap
const FANBASE_SUCCESS_STEP = 0.05;
const FANBASE_FAILURE_STEP = 0.03;

export const FRANCHISE_PRESTIGE_MIN = 0;
export const FRANCHISE_PRESTIGE_MAX = 30;
const PRESTIGE_SUCCESS_STEP = 3;
const PRESTIGE_FAILURE_STEP = 2;

const SUCCESS_VERDICTS = new Set([
  VERDICTS.HIT,
  VERDICTS.BLOCKBUSTER,
  VERDICTS.ALL_TIME_BLOCKBUSTER,
]);
const FAILURE_VERDICTS = new Set([VERDICTS.FLOP, VERDICTS.DISASTER]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Compute a franchise's updated reputation after one installment is released.
 * PURE: returns new values, mutates nothing. Uses the same success/failure
 * verdict classification as studioGrowthEngine so the two stay consistent.
 *
 * @param {object} franchise - current stored franchise fields
 *                             ({ fanbaseMultiplier, prestigeBonus, totalRevenue }).
 * @param {object} movie     - the released movie ({ verdict, worldwideGross }).
 * @returns {{ fanbaseMultiplier: number, prestigeBonus: number, totalRevenue: number }}
 */
export const computeFranchiseProgress = (franchise = {}, movie = {}) => {
  const currentFanbase =
    typeof franchise.fanbaseMultiplier === "number"
      ? franchise.fanbaseMultiplier
      : FRANCHISE_FANBASE_MIN;
  const currentPrestige =
    typeof franchise.prestigeBonus === "number"
      ? franchise.prestigeBonus
      : FRANCHISE_PRESTIGE_MIN;
  const currentRevenue =
    typeof franchise.totalRevenue === "number" ? franchise.totalRevenue : 0;

  const verdict = movie.verdict;
  const isSuccess = SUCCESS_VERDICTS.has(verdict);
  const isFailure = FAILURE_VERDICTS.has(verdict);

  let fanbaseMultiplier = currentFanbase;
  let prestigeBonus = currentPrestige;

  if (isSuccess) {
    fanbaseMultiplier = currentFanbase + FANBASE_SUCCESS_STEP;
    prestigeBonus = currentPrestige + PRESTIGE_SUCCESS_STEP;
  } else if (isFailure) {
    fanbaseMultiplier = currentFanbase - FANBASE_FAILURE_STEP;
    prestigeBonus = currentPrestige - PRESTIGE_FAILURE_STEP;
  }
  // Neutral verdicts (AVERAGE / N/A) leave the franchise's reputation unchanged.

  fanbaseMultiplier = Number(
    clamp(fanbaseMultiplier, FRANCHISE_FANBASE_MIN, FRANCHISE_FANBASE_MAX).toFixed(4)
  );
  prestigeBonus = clamp(
    Math.round(prestigeBonus),
    FRANCHISE_PRESTIGE_MIN,
    FRANCHISE_PRESTIGE_MAX
  );

  const totalRevenue = currentRevenue + (Number(movie.worldwideGross) || 0);

  return { fanbaseMultiplier, prestigeBonus, totalRevenue };
};

/**
 * Escapes regex special characters in a string.
 *
 * @param {string} string
 * @returns {string} Escaped string
 */
export const escapeRegex = (string) => {
  if (typeof string !== "string") return "";
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

/**
 * Checks if a movie title matches the franchise name (case-insensitive).
 * Escapes any special regex characters in the franchise name.
 *
 * @param {string} movieTitle
 * @param {string} franchiseName
 * @returns {boolean} True if matches
 */
export const matchFranchiseTitle = (movieTitle, franchiseName) => {
  if (!movieTitle || !franchiseName) return false;
  const escaped = escapeRegex(franchiseName);
  const regex = new RegExp(`^${escaped}`, "i");
  return regex.test(movieTitle);
};
