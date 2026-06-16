/**
 * @fileoverview Box Office Engine
 *
 * Calculates the financial performance of a released movie. The engine
 * produces opening weekend, domestic/international gross, worldwide gross,
 * profit, ROI, and a human-readable verdict — all derived from the movie's
 * quality, hype, marketing budget, lead actor popularity, and the current
 * genre market multiplier.
 *
 * No database access is performed here; the caller is responsible for
 * persisting the returned values back to the movie document.
 */

/**
 * Converts a return-on-investment (ROI) ratio into a human-readable verdict.
 *
 * Thresholds:
 * - ROI < -0.5   → "DISASTER"
 * - ROI < 0      → "FLOP"
 * - ROI ≤ 0.25   → "AVERAGE"
 * - ROI ≤ 1.0    → "HIT"
 * - ROI ≤ 3.0    → "BLOCKBUSTER"
 * - ROI > 3.0    → "LEGENDARY"
 *
 * @param {number} roi - Profit divided by total budget. Negative means a loss.
 * @returns {"DISASTER"|"FLOP"|"AVERAGE"|"HIT"|"BLOCKBUSTER"|"LEGENDARY"} verdict
 */
const getVerdict = (roi) => {
  if (roi < -0.5) return "DISASTER";
  if (roi < 0) return "FLOP";
  if (roi <= 0.25) return "AVERAGE";
  if (roi <= 1.0) return "HIT";
  if (roi <= 3.0) return "BLOCKBUSTER";
  return "LEGENDARY";
};

/**
 * Generates the full box-office result for a movie release.
 *
 * ## Calculation Flow
 *
 * 1. **Opening Weekend**
 *    - Base: ₹1,000,000 (flat floor)
 *    - + Star Power: actor popularity mapped to up to ₹500,000
 *    - + Marketing Boost: half the marketing budget
 *    - × Hype factor (0.5–1.5 range) and a ±20% random variance
 *    - × `marketMultiplier` (genre trend; defaults to 1 — neutral)
 *
 * 2. **Worldwide Gross**
 *    - Opening Weekend × a "legs" factor driven by audience score (4×)
 *      and critic score (1×), representing how long the film stays in cinemas.
 *    - An additional ±10% random variance is applied.
 *
 * 3. **Domestic / International Split**
 *    - Domestic = 45% of worldwide gross.
 *    - International = remaining 55%.
 *
 * 4. **Profit & ROI**
 *    - Profit = worldwideGross − (productionBudget + marketingBudget)
 *    - ROI    = profit / totalBudget (falls back to gross/1M when budget is 0)
 *
 * 5. **Verdict** — derived from ROI via `getVerdict`.
 *
 * @param {object} movie - The movie document.
 * @param {number} movie.quality          - Overall quality score (0–100).
 * @param {number} movie.criticScore      - Critic score (0–100).
 * @param {number} movie.audienceScore    - Audience score (0–100).
 * @param {number} movie.hype             - Pre-release hype level (0–100).
 * @param {number} [movie.budget=0]       - Production budget in ₹.
 * @param {number} [movie.marketingBudget=0] - Marketing budget in ₹.
 * @param {object} leadActor - The lead actor embedded document.
 * @param {number} leadActor.popularity   - Actor popularity (0–100).
 * @param {object} director               - The director (currently unused, reserved for future expansions).
 * @param {number} [marketMultiplier=1]   - Combined genre-trend multiplier from trendEngine.
 *                                          Values > 1 boost; values < 1 dampen box office.
 * @returns {{
 *   openingWeekend: number,
 *   domesticGross: number,
 *   internationalGross: number,
 *   worldwideGross: number,
 *   boxOffice: number,
 *   profit: number,
 *   roi: number,
 *   verdict: string
 * }} Full box-office breakdown.
 */
export const generateBoxOffice = (movie, leadActor, director, marketMultiplier = 1) => {
  const qualityFactor = movie.quality / 100;
  const criticFactor = movie.criticScore / 100;
  const audienceFactor = movie.audienceScore / 100;
  const hypeFactor = movie.hype / 100;

  // Base potential based on hype and quality
  const basePotential = (hypeFactor * 0.6) + (qualityFactor * 0.4);

  // Opening Weekend influenced heavily by Hype and Actor Popularity
  const openingBase = 1000000; // 1M base
  const starPower = (leadActor.popularity / 100) * 500000;
  const marketingBoost = (movie.marketingBudget / 2);

  // Market Trends multiplier (defaults to 1 = no active trend for this
  // movie's genre). Applied at the opening weekend so it propagates through
  // worldwide gross, profit, ROI, and verdict.
  const openingWeekend = Math.round(
    (openingBase + starPower + marketingBoost) * (hypeFactor + 0.5) * (0.8 + Math.random() * 0.4) * marketMultiplier
  );

  // Worldwide Gross influenced by Audience Score (legs) and Critic Score (prestige)
  // Legs factor: high audience score means movie stays in theaters longer
  const legs = (audienceFactor * 4) + (criticFactor * 1);
  const worldwideGross = Math.round(openingWeekend * (2 + legs) * (0.9 + Math.random() * 0.2));

  const domesticGross = Math.round(worldwideGross * 0.45);
  const internationalGross = worldwideGross - domesticGross;

  const totalBudget = (movie.budget || 0) + (movie.marketingBudget || 0);
  // Instruction: profit = worldwideGross - productionBudget - marketingBudget
  // Note: Usually studios only get ~50% of box office, but following instructions literally for profit calc
  const profit = worldwideGross - totalBudget;
  const roi = totalBudget > 0 ? profit / totalBudget : worldwideGross / 1000000; // Fallback if budget 0

  return {
    openingWeekend,
    domesticGross,
    internationalGross,
    worldwideGross,
    boxOffice: worldwideGross,
    profit,
    roi,
    verdict: getVerdict(roi)
  };
};
