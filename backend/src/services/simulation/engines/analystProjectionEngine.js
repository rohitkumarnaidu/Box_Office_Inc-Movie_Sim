/**
 * @fileoverview Box Office Analyst Projections Engine
 *
 * Generates pre-release box office estimates and analyst forecasts
 * for a movie that is in READY_FOR_RELEASE status.
 *
 * The projection is calculated from the movie's quality, hype, marketing
 * spend, and lead actor popularity - producing a low/mid/high estimate range
 * along with a human-readable analyst rating.
 *
 * No database writes are performed; this is a pure read-based calculation.
 */

/**
 * Produces opening weekend projections and analyst commentary for a movie.
 *
 * @param {object} movie          - The movie document.
 * @param {number} movie.quality  - Overall quality score (0–100).
 * @param {number} movie.hype     - Pre-release hype (0–100).
 * @param {number} [movie.budget=0]          - Production budget.
 * @param {number} [movie.marketingBudget=0] - Marketing budget.
 * @param {object} leadActor              - Lead actor embedded object.
 * @param {number} leadActor.popularity   - Actor popularity (0–100).
 * @param {number} [marketMultiplier=1]   - Genre trend multiplier from trendEngine.
 * @returns {{
 *   low: number,
 *   mid: number,
 *   high: number,
 *   analystRating: string,
 *   summary: string
 * }}
 */
export const generateBoxOfficeProjection = (movie, leadActor, marketMultiplier = 1) => {
  const scaleBudget = Math.max(movie.budget || 0, 1_000_000);
  const hypeFactor = (movie.hype || 0) / 100;
  const qualityFactor = (movie.quality || 0) / 100;
  const starFactor = (leadActor?.popularity || 50) / 100;
  const marketingBoost = (movie.marketingBudget || 0) * 0.5;

  // Base mid estimate modelled similarly to the actual box office engine
  const baseMid = Math.round(
    (scaleBudget * 0.12 + scaleBudget * 0.18 * starFactor + marketingBoost)
      * (hypeFactor + 0.4)
      * marketMultiplier
  );

  // Quality tilts the range: high-quality = tighter upside; low-quality = wider risk
  const qualityBias = 0.15 + qualityFactor * 0.25; // 15% – 40%

  const low  = Math.round(baseMid * (1 - qualityBias) * 0.85);
  const mid  = baseMid;
  const high = Math.round(baseMid * (1 + qualityBias) * 1.15);

  // Analyst rating based on projected mid vs production budget
  const budgetCoverRatio = mid / (scaleBudget + (movie.marketingBudget || 0));
  let analystRating;
  let summary;

  if (budgetCoverRatio >= 3.0) {
    analystRating = "MUST_WATCH";
    summary = "Analysts are predicting a massive opening. The film has a strong shot at all-time records.";
  } else if (budgetCoverRatio >= 1.5) {
    analystRating = "STRONG_PERFORMER";
    summary = "Projections look healthy. Expect a solid opening weekend well above break-even.";
  } else if (budgetCoverRatio >= 0.8) {
    analystRating = "MODERATE";
    summary = "This one could go either way. Marketing execution and word-of-mouth will be decisive.";
  } else if (budgetCoverRatio >= 0.4) {
    analystRating = "RISKY";
    summary = "Below-budget projections. A strong opening day is critical to avoid a box office disappointment.";
  } else {
    analystRating = "POTENTIAL_BOMB";
    summary = "Analysts are pessimistic. Limited audience appeal and low hype signal a difficult release weekend.";
  }

  return { low, mid, high, analystRating, summary };
};
