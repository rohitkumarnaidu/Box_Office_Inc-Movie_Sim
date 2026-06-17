/**
 * @fileoverview Studio Growth Engine
 *
 * Applies studio-level side-effects after a movie is released. Called once
 * per release from the movie controller, immediately after the box-office and
 * career-impact engines have run.
 *
 * Responsibilities:
 *  - Credits movie profit to `studio.money`.
 *  - Grows or shrinks `studio.fans` based on audience score and verdict.
 *  - Grows or shrinks `studio.prestige` based on critic score, quality, and verdict.
 *  - Maintains aggregate stats (hits, flops, total revenue, rolling averages, etc.).
 *  - Updates highest-grossing, most-profitable, and best-reviewed movie records.
 *  - Triggers a studio level-up notification when the fan milestone is reached.
 *
 * No database save is performed here; the caller persists the mutated studio document.
 */

/**
 * Applies post-release growth effects to the studio and returns the fan/prestige gains.
 *
 * ## Fan Growth Formula
 * ```
 * fanGain = round((worldwideGross / 1000) × audienceScoreFactor × verdictMultiplier)
 * ```
 * - `verdictMultiplier`: 2 for successes, 1 for average, 0.5 for failures.
 * - `studio.fans` is unbounded (it drives level-up thresholds).
 *
 * ## Prestige Growth Formula
 * ```
 * prestigeGain = round((criticScoreFactor × 10) + (qualityFactor × 5) + verdictBonus)
 * ```
 * - `verdictBonus`: +20 for successes, 0 for average, −10 for failures.
 * - `studio.prestige` is floored at 0.
 *
 * ## Studio Level-Up
 * The studio levels up when `studio.fans >= studioLevel × 100,000`.
 * Each level-up increments `studio.studioLevel` and fires a notification.
 *
 * ## Aggregate Stats Updated
 * | Field              | Update                                         |
 * |--------------------|------------------------------------------------|
 * | moviesReleased     | +1                                             |
 * | hits/blockbusters… | +1 for matching verdict                       |
 * | totalRevenue       | + worldwideGross                               |
 * | totalProfit        | + profit                                       |
 * | avgCriticScore     | Rolling average (previous avg × count + new)   |
 * | avgAudienceScore   | Rolling average (previous avg × count + new)   |
 *
 * @param {object} gameState            - GameState document; used to queue notifications.
 * @param {object} studio               - Studio document (mutated in place).
 * @param {number} [studio.money=0]     - Current cash balance; receives movie profit.
 * @param {number} [studio.fans=0]      - Current fan count.
 * @param {number} [studio.prestige=0]  - Current prestige score.
 * @param {number} [studio.studioLevel=1] - Current studio level.
 * @param {object} movie                - The released movie document.
 * @param {string} movie.verdict        - Box-office verdict (e.g. "HIT", "FLOP").
 * @param {number} movie.worldwideGross - Total worldwide gross in ₹.
 * @param {number} movie.profit         - Net profit (gross − total budget) in ₹.
 * @param {number} movie.audienceScore  - Audience score (0–100).
 * @param {number} movie.criticScore    - Critic score (0–100).
 * @param {number} movie.quality        - Overall quality (0–100).
 * @param {string} movie.title          - Movie title (for record tracking).
 * @param {string|object} movie._id     - MongoDB ObjectId (for record tracking).
 * @returns {{ fanGain: number, prestigeGain: number }} Actual deltas applied.
 */
import { addNotification } from "../helpers/notificationHelper.js";

export const processStudioGrowth = (gameState, studio, movie) => {
  const isHit = movie.verdict === "HIT";
  const isBlockbuster = movie.verdict === "BLOCKBUSTER";
  const isLegendary = movie.verdict === "LEGENDARY";
  const isFlop = movie.verdict === "FLOP";
  const isDisaster = movie.verdict === "DISASTER";

  const isSuccess = isHit || isBlockbuster || isLegendary;
  const isFailure = isFlop || isDisaster;

  // Ensure stats object exists
  studio.stats = studio.stats || {
    moviesReleased: 0,
    hits: 0,
    blockbusters: 0,
    allTimeBlockbusters: 0,
    flops: 0,
    disasters: 0,
    totalRevenue: 0,
    totalProfit: 0,
    avgCriticScore: 0,
    avgAudienceScore: 0
  };

  // Money update (handled in controller but logic for record tracking)
  studio.money += movie.profit;

  // Fan Growth: Audience Score, Box Office, Verdict
  const audienceScoreFactor = movie.audienceScore / 100;
  const verdictMultiplier = isSuccess ? 2 : isFailure ? 0.5 : 1;
  const fanGain = Math.round((movie.worldwideGross / 1000) * audienceScoreFactor * verdictMultiplier);
  studio.fans = (studio.fans || 0) + fanGain;

  // Prestige Growth: Critic Score, Verdict, Quality
  const criticScoreFactor = movie.criticScore / 100;
  const qualityFactor = movie.quality / 100;
  const prestigeGain = Math.round((criticScoreFactor * 10) + (qualityFactor * 5) + (isSuccess ? 20 : isFailure ? -10 : 0));
  studio.prestige = Math.max(0, (studio.prestige || 0) + prestigeGain);

  // Update Stats
  const s = studio.stats;
  const prevCount = s.moviesReleased;
  s.moviesReleased += 1;
  if (isHit) s.hits += 1;
  if (isBlockbuster) s.blockbusters += 1;
  if (isLegendary) s.allTimeBlockbusters += 1;
  if (isFlop) s.flops += 1;
  if (isDisaster) s.disasters += 1;

  s.totalRevenue += movie.worldwideGross;
  s.totalProfit += movie.profit;
  s.avgCriticScore = ((s.avgCriticScore * prevCount) + movie.criticScore) / s.moviesReleased;
  s.avgAudienceScore = ((s.avgAudienceScore * prevCount) + movie.audienceScore) / s.moviesReleased;

  // Update records
  if (movie.worldwideGross > (studio.highestGrossingMovie?.amount || 0)) {
    studio.highestGrossingMovie = { id: movie._id, title: movie.title, amount: movie.worldwideGross };
  }
  if (movie.profit > (studio.mostProfitableMovie?.amount || 0)) {
    studio.mostProfitableMovie = { id: movie._id, title: movie.title, amount: movie.profit };
  }
  if (movie.criticScore > (studio.bestReviewedMovie?.amount || 0)) {
    studio.bestReviewedMovie = { id: movie._id, title: movie.title, amount: movie.criticScore };
  }

  // Studio Level Progression (simple check)
  const nextLevelThreshold = studio.studioLevel * 100000;
  if (studio.fans >= nextLevelThreshold) {
    studio.studioLevel += 1;
    addNotification(gameState, `Congratulations! Studio leveled up to ${studio.studioLevel}!`);
  }

  return { fanGain, prestigeGain };
};
