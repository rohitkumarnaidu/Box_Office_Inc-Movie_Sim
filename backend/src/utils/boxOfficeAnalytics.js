/**
 * @fileoverview Box Office Analytics & Telemetry Utility
 * 
 * Provides calculation functions for regional box office market splits,
 * week-over-week theatrical screen decay, seat occupancy rates, and gross projections.
 */

/**
 * Calculates regional distribution breakdown for a movie based on its total box office.
 * 
 * @param {number} totalGross - The worldwide box office gross.
 * @param {object} [genreWeights] - Optional weights per genre.
 * @returns {object} Regional breakdown in INR.
 */
export const calculateRegionalBreakdown = (totalGross, genreWeights = {}) => {
  const gross = Math.max(0, Number(totalGross) || 0);

  // Base regional shares
  const naShare = genreWeights.action ? 0.40 : 0.35;
  const euShare = genreWeights.drama ? 0.30 : 0.25;
  const apacShare = genreWeights.sciFi ? 0.35 : 0.28;
  const latamShare = 1.0 - (naShare + euShare + apacShare);

  return {
    northAmerica: Math.round(gross * naShare),
    europe: Math.round(gross * euShare),
    asiaPacific: Math.round(gross * apacShare),
    latinAmerica: Math.round(gross * Math.max(0.02, latamShare)),
    totalWorldwide: gross,
  };
};

/**
 * Computes screen drop-off decay rate per week.
 * 
 * @param {number} currentWeek - Active week of release (1-indexed).
 * @param {number} initialScreens - Starting theater screen count.
 * @param {number} audienceScore - Audience score (0-100).
 * @returns {number} Estimated screens remaining.
 */
export const computeScreenDecay = (currentWeek, initialScreens, audienceScore = 50) => {
  if (currentWeek <= 1) return initialScreens;
  const wordOfMouthMultiplier = (audienceScore / 100) * 0.4 + 0.6;
  const baseDecay = Math.pow(0.78, currentWeek - 1);
  const adjustedDecay = baseDecay * wordOfMouthMultiplier;
  return Math.max(50, Math.round(initialScreens * adjustedDecay));
};

/**
 * Generates telemetry metrics summary for studio box office reports.
 * 
 * @param {object} movie - Movie document object.
 * @returns {object} Analytics telemetry summary.
 */
export const generateBoxOfficeTelemetry = (movie) => {
  const worldwide = movie.worldwideGross || movie.boxOffice || 0;
  const budget = (movie.budget || 0) + (movie.marketingBudget || 0);
  const regional = calculateRegionalBreakdown(worldwide);

  return {
    movieId: movie._id,
    title: movie.title,
    worldwideGross: worldwide,
    totalBudget: budget,
    profitMargin: budget > 0 ? Number(((worldwide - budget) / budget * 100).toFixed(2)) : 0,
    regionalBreakdown: regional,
    occupancyEfficiency: movie.audienceScore ? Number((movie.audienceScore * 0.85).toFixed(1)) : 60.0,
  };
};
