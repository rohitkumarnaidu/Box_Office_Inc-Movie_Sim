/**
 * @fileoverview Franchise Synergy & Crossover Calculator Utility
 */

/**
 * Calculates net franchise momentum and fatigue factor.
 * 
 * @param {number} installmentCount - Number of releases in the cinematic universe.
 * @param {number} averageQuality - Average quality rating of preceding films.
 * @param {number} fatigueDecay - Fatigue decay multiplier.
 * @returns {object} Calculated multiplier & fatigue metrics.
 */
export const calculateUniverseSynergy = (installmentCount, averageQuality, fatigueDecay = 0.05) => {
  const count = Math.max(1, installmentCount);
  const quality = Math.min(100, Math.max(0, averageQuality));

  const hypeBonus = (count - 1) * 0.12 * (quality / 100);
  const fatiguePenalty = Math.pow(1 + fatigueDecay, count - 1) - 1;

  const netMultiplier = Math.max(0.5, Math.min(2.5, 1.0 + hypeBonus - fatiguePenalty));

  return {
    netMultiplier: Number(netMultiplier.toFixed(2)),
    hypeBonus: Number(hypeBonus.toFixed(2)),
    fatiguePenalty: Number(fatiguePenalty.toFixed(2)),
  };
};
