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
 * Hard cap on any single gross figure. JavaScript Numbers are 64-bit doubles
 * and remain precise up to 2^53, but the game economy never warrants values
 * above ₹10 Billion — anything beyond that is clamped to avoid arithmetic
 * anomalies (e.g., Infinity, -0, or precision drift near MAX_SAFE_INTEGER).
 */
export const MAX_GROSS = 10_000_000_000; // ₹10 Billion

/**
 * Generates the full box-office result for a movie release.
 *
 * @param {object} movie - The movie document.
 * @param {object} leadActor - The lead actor embedded document.
 * @param {object} director - The director embedded document.
 * @param {number} [marketMultiplier=1] - Genre-trend multiplier.
 * @param {number} [demographicMultiplier=1] - Demographic multiplier.
 * @returns {object} Full box-office breakdown.
 */
export const generateBoxOffice = (movie, leadActor, director, marketMultiplier = 1, demographicMultiplier = 1) => {
  const qualityFactor = movie.quality / 100;
  const criticFactor = movie.criticScore / 100;
  const audienceFactor = movie.audienceScore / 100;
  const hypeFactor = movie.hype / 100;

  const productionBudget = movie.budget || 0;
  const scaleBudget = Math.max(productionBudget, 1000000);

  const openingBase = scaleBudget * 0.12; 
  const starPower = (leadActor.popularity / 100) * (scaleBudget * 0.18);
  const marketingBoost = (movie.marketingBudget || 0) * 0.5;

  const sequelNumber = movie.sequelNumber || 1;
  const franchiseBonus = Math.min(0.5, (sequelNumber - 1) * 0.1);
  const franchiseMultiplier = 1 + franchiseBonus;

  const openingWeekend = Math.round(
    (openingBase + starPower + marketingBoost) * (hypeFactor + 0.4) * (0.7 + Math.random() * 0.6) * marketMultiplier * franchiseMultiplier * demographicMultiplier
  );

  const legs = (audienceFactor * 5) + (criticFactor * 2) + (Math.random() * 2);
  const rawWorldwideGross = Math.round(openingWeekend * (1.5 + legs) * (0.8 + Math.random() * 0.4));
  const worldwideGross = Math.min(rawWorldwideGross, MAX_GROSS);

  const domesticGross = Math.min(Math.round(worldwideGross * 0.45), MAX_GROSS);
  const internationalGross = Math.min(worldwideGross - domesticGross, MAX_GROSS);

  const totalBudget = (movie.budget || 0) + (movie.marketingBudget || 0);
  const profit = worldwideGross - totalBudget;
  const roi = totalBudget > 0 ? profit / totalBudget : worldwideGross / 1000000;
  const verdict = getVerdict(roi);

  const regionalSplit = {
    northAmerica: domesticGross,
    europe: Math.round(internationalGross * 0.45),
    asiaPacific: Math.round(internationalGross * 0.40),
    latinAmerica: Math.round(internationalGross * 0.15),
  };

  return {
    openingWeekend: Math.min(openingWeekend, MAX_GROSS),
    domesticGross,
    internationalGross,
    worldwideGross,
    boxOffice: worldwideGross,
    profit,
    roi,
    verdict,
    regionalSplit,
  };
};
