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

import { VERDICTS, getVerdict } from "../../../constants/verdicts.js";

/**
 * Generates the full box-office result for a movie release.
 *
 * ## Calculation Flow
 *
 * 1. **Opening Weekend**
 *    - Base: Scaled based on production budget
 *    - + Star Power: actor popularity mapped to budget scale
 *    - + Marketing Boost: scaled by marketing budget
 *    - × Hype factor and a random variance
 *    - × `marketMultiplier` (genre trend; defaults to 1 — neutral)
 *
 * 2. **Worldwide Gross**
 *    - Opening Weekend × a "legs" factor driven by audience score
 *      and critic score, representing how long the film stays in cinemas.
 *    - An additional random variance is applied.
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
export const generateBoxOffice = (movie, leadActor, director, marketMultiplier = 1, demographicMultiplier = 1) => {
  const qualityFactor = movie.quality / 100;
  const criticFactor = movie.criticScore / 100;
  const audienceFactor = movie.audienceScore / 100;
  const hypeFactor = movie.hype / 100;

  // Base potential based on hype and quality
  const basePotential = (hypeFactor * 0.6) + (qualityFactor * 0.4);

  const productionBudget = movie.budget || 0;
  const scaleBudget = Math.max(productionBudget, 1000000);

  // Opening Weekend influenced heavily by Hype and Actor Popularity
  const openingBase = scaleBudget * 0.12; 
  const starPower = (leadActor.popularity / 100) * (scaleBudget * 0.18);
  const marketingBoost = (movie.marketingBudget || 0) * 0.5;

  // Franchise sequel bonus: +10% per prior installment, capped at +50%
  const sequelNumber = movie.sequelNumber || 1;
  const franchiseBonus = Math.min(0.5, (sequelNumber - 1) * 0.1);
  const franchiseMultiplier = 1 + franchiseBonus;

  // Market Trends multiplier (defaults to 1 = no active trend for this
  // movie's genre). Applied at the opening weekend so it propagates through
  // worldwide gross, profit, ROI, and verdict.
  const openingWeekend = Math.round(
    (openingBase + starPower + marketingBoost) * (hypeFactor + 0.4) * (0.7 + Math.random() * 0.6) * marketMultiplier * franchiseMultiplier * demographicMultiplier
  );

  // Worldwide Gross influenced by Audience Score (legs) and Critic Score (prestige)
  // Legs factor: high audience score means movie stays in theaters longer
  const legs = (audienceFactor * 5) + (criticFactor * 2) + (Math.random() * 2);
  const worldwideGross = Math.round(openingWeekend * (1.5 + legs) * (0.8 + Math.random() * 0.4));

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
