/**
 * @fileoverview Verdict Constants and Thresholds
 *
 * Defines the canonical categories for a movie's financial success along
 * with the numerical ROI thresholds that map to each verdict. This is the
 * single source of truth — all engines MUST import getVerdict() from here
 * rather than hardcoding their own threshold logic.
 *
 * ## Threshold Design Rationale
 *
 * The thresholds reflect a logarithmic perception of success:
 * - Negative ROI is punishing (flop ends at 0, disaster below -0.5)
 * - Breaking even (roi ≈ 0) still only earns "AVERAGE" — not a win
 * - Doubling investment (roi ≥ 1.0) is a clear "HIT"
 * - Tripling (roi ≥ 3.0) is "BLOCKBUSTER" — exceptional but achievable
 * - roi ≥ 10.0 is reserved for cultural phenomena ("ALL_TIME_BLOCKBUSTER")
 *
 * These thresholds apply uniformly to both player-owned and rival-studio
 * movies. Any per-faction asymmetry should be expressed through the ROI
 * calculation itself, not through different verdict mappings.
 */

// ---------------------------------------------------------------------------
// String constants (used as verdict values across the codebase)
// ---------------------------------------------------------------------------

export const VERDICTS = {
  DISASTER: "DISASTER",
  FLOP: "FLOP",
  AVERAGE: "AVERAGE",
  HIT: "HIT",
  BLOCKBUSTER: "BLOCKBUSTER",
  ALL_TIME_BLOCKBUSTER: "ALL_TIME_BLOCKBUSTER",
};

export const VERDICT_LIST = Object.values(VERDICTS);

// ---------------------------------------------------------------------------
// ROI Thresholds
// ---------------------------------------------------------------------------

/**
 * Ordered threshold definitions (ascending). Each entry defines the
 * minimum ROI (inclusive) required to reach that tier.
 *
 * The thresholds form a partition of the real number line:
 *   (-∞, -0.5)       → DISASTER
 *   [-0.5, 0)        → FLOP
 *   [0, 0.25]        → AVERAGE
 *   (0.25, 1.0]      → HIT
 *   (1.0, 3.0]       → BLOCKBUSTER
 *   (3.0, ∞)         → ALL_TIME_BLOCKBUSTER
 *
 * @type {Array<{ min: number, verdict: string }>}
 */
export const VERDICT_TIERS = [
  { min: -Infinity, verdict: VERDICTS.DISASTER },
  { min: -0.5,      verdict: VERDICTS.FLOP },
  { min: 0,         verdict: VERDICTS.AVERAGE },
  { min: 0.25,      verdict: VERDICTS.HIT },
  { min: 1.0,       verdict: VERDICTS.BLOCKBUSTER },
  { min: 3.0,       verdict: VERDICTS.ALL_TIME_BLOCKBUSTER },
];

/**
 * Convenience map for quick threshold lookups.
 * @type {Object<string, { min: number, max: number }>}
 */
export const VERDICT_THRESHOLDS = {
  [VERDICTS.DISASTER]:            { max: -0.5 },
  [VERDICTS.FLOP]:                { min: -0.5, max: 0 },
  [VERDICTS.AVERAGE]:             { min: 0,    max: 0.25 },
  [VERDICTS.HIT]:                 { min: 0.25, max: 1.0 },
  [VERDICTS.BLOCKBUSTER]:         { min: 1.0,  max: 3.0 },
  [VERDICTS.ALL_TIME_BLOCKBUSTER]:{ min: 3.0 },
};

// ---------------------------------------------------------------------------
// Verdict resolution function (SINGLE SOURCE OF TRUTH)
// ---------------------------------------------------------------------------

/**
 * Converts a return-on-investment (ROI) ratio into a human-readable verdict.
 *
 * The thresholds are designed so that a "HIT" (roi ≥ 0.25) requires at least
 * breaking even with a modest return, while "ALL_TIME_BLOCKBUSTER" is reserved
 * for exceptional hits (roi ≥ 3.0).
 *
 * @param {number} roi - Profit divided by total budget. Negative means a loss.
 * @returns {string} One of the `VERDICTS` values.
 */
export const getVerdict = (roi) => {
  if (roi < -0.5) return VERDICTS.DISASTER;
  if (roi < 0)    return VERDICTS.FLOP;
  if (roi <= 0.25) return VERDICTS.AVERAGE;
  if (roi <= 1.0)  return VERDICTS.HIT;
  if (roi <= 3.0)  return VERDICTS.BLOCKBUSTER;
  return VERDICTS.ALL_TIME_BLOCKBUSTER;
};
