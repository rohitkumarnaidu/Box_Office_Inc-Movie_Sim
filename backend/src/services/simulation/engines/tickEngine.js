import { processDirectorAwards } from "../../director/directorAwardsService.js";
import { processDirectorAging } from "./directorEngine.js";
import { processDirectingProjects } from "./directingProjectEngine.js";
import { processProduction } from "./productionEngine.js";
import { processWriterPayroll } from "./payrollEngine.js";
import { processWritingProjects } from "./writerEngine.js";
import { processMarketTrends } from "./trendEngine.js";
import { processRandomEvents } from "./eventEngine.js";

import { addNotification } from "../helpers/notificationHelper.js";
import { processWriterAging } from "../helpers/agingHelper.js";

/**
 * @fileoverview Tick Engine — Weekly Simulation Orchestrator
 *
 * This is the central coordinator for a single simulation week. It calls every
 * sub-engine in a specific, intentional order so that each phase can observe
 * the side-effects of the previous phase.
 *
 * ## Execution Order (per weekly tick)
 * 1. **Market Trends** — advance the genre trend climate; any trend notifications
 *    are queued before other events so they appear at the top of the feed.
 * 2. **Writer Payroll** — deduct all talent salaries from studio funds while
 *    the market state is already up-to-date.
 * 3. **Writing Projects** — advance writer projects; may complete scripts and
 *    free writers back to the market.
 * 4. **Directing Projects** — advance director projects; may complete pre-production
 *    packages and free directors.
 * 5. **Production** — advance movies through PRE_PRODUCTION → PRODUCTION →
 *    POST_PRODUCTION → READY_FOR_RELEASE.
 * 6. **Writer Aging** — age all writers by one week-unit (runs yearly).
 * 7. **Director Aging** — age all directors; retire those past the age cap.
 * 8. **Director Awards** — evaluate award eligibility for owned directors.
 * 9. **Random Events** — roll for industry events last so they react to the
 *    week's financial activity and can adjust studio stats before persistence.
 *
 * @module tickEngine
 */

/**
 * Runs one full week of the simulation for a studio.
 *
 * Mutates `gameState` and `studio` in place across all sub-engines. The caller
 * (`runWeeklySimulation`) is responsible for persisting both documents after
 * this function resolves.
 *
 * @async
 * @param {object} gameState    - GameState mongoose document for the current studio.
 * @param {number} gameState.currentWeek - The week that is currently being processed.
 * @param {object} studio       - Studio mongoose document for the current studio.
 * @returns {Promise<object>}   The mutated `gameState` after all engines have run.
 */
export const processWeeklyTick = async (gameState, studio) => {
  // Advance the market climate first so any releases this tick reflect the
  // current week's active trends.
  const trendMessages = processMarketTrends(gameState);
  trendMessages.forEach((msg) => addNotification(gameState, msg));

  processWriterPayroll(gameState, studio);

  await processWritingProjects(gameState, studio);

  processDirectingProjects(gameState, studio);

  await processProduction(gameState, studio);

  processWriterAging(gameState);

  processDirectorAging(gameState);

  processDirectorAwards(gameState, studio);

  // Roll for global random industry events last, so they react to the week's
  // activity and can adjust studio money/fans/prestige before persistence.
  processRandomEvents(gameState, studio);

  return gameState;
};

export default processWeeklyTick;
