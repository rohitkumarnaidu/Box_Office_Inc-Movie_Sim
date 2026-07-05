import { processDirectorAwards } from "../../director/directorAwardsService.js";
import { processActorAwards } from "../../actor/actorAwardsService.js";
import { processCrewProgression } from "../../crew/crewProgressionService.js";
import { processDirectorAging } from "./directorEngine.js";
import { processDirectingProjects } from "./directingProjectEngine.js";
import { processProduction } from "./productionEngine.js";
import { processWriterPayroll } from "./payrollEngine.js";
import { processWritingProjects } from "./writerEngine.js";
import { processScheduledReleases } from "./clashEngine.js";
import { processFestivalResults } from "./festivalEngine.js";
import { processMarketTrends } from "./trendEngine.js";
import { generateRivalStudios, processRivalStudios } from "./rivalStudioEngine.js";
import { processProductionEvents } from "./eventEngine.js";
import { processRandomEvents } from "./eventEngine.js";
import { processMerchandiseSales } from "./merchandiseEngine.js";
import { processAnnualAwards } from "./awardsEngine.js";
import { generateNewsFromTrend, generateNewsFromEvent } from "./newsEngine.js";
import { processStreamingPlatformGrowth, processStreamingRevenue } from "./streamingEngine.js";

import { addNotification } from "../helpers/notificationHelper.js";
import { processWriterAging } from "../helpers/agingHelper.js";
import TalentHistory from "../../../models/TalentHistory.js";

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
  // Initialize rival studios on the very first tick (once per game)
  generateRivalStudios(gameState);

  // Advance the market climate first so any releases this tick reflect the
  // current week's active trends.
  const trendMessages = processMarketTrends(gameState);
  trendMessages.forEach((msg) => addNotification(gameState, msg));

  // Generate news items for newly spawned trends
  if (gameState.marketTrends && gameState.marketTrends.activeTrends) {
    for (const trend of gameState.marketTrends.activeTrends) {
      if (trend.startWeek === gameState.currentWeek) {
        await generateNewsFromTrend(trend, gameState.currentWeek);
      }
    }
  }

  processWriterPayroll(gameState, studio);

  await processWritingProjects(gameState, studio);

  processDirectingProjects(gameState, studio);

  await processProduction(gameState, studio);

  // Tick rival studios — collect their releases for the weekly summary
  const rivalReleases = processRivalStudios(gameState);

  processWriterAging(gameState);

  processDirectorAging(gameState);

  const awardYear = Math.floor((Number(gameState.currentWeek || 1) - 1) / 52) + 1;
  const isAwardWeek = gameState.currentWeek % 52 === 0;
  const directorAlreadyProcessed = (gameState.directorAwardYearsProcessed || []).includes(awardYear);
  const actorAlreadyProcessed = (gameState.actorAwardYearsProcessed || []).includes(awardYear);

  if (isAwardWeek && (!directorAlreadyProcessed || !actorAlreadyProcessed)) {
    const histories = await TalentHistory.find({ gameStateId: gameState._id }).lean();

    const attachHistory = (talentList) => {
      if (!talentList) return;
      talentList.forEach((talent) => {
        talent.careerHistory = histories.filter(h => h.talentId === talent.id && h.type === "CAREER").map(h => h.data);
        talent.awardsHistory = histories.filter(h => h.talentId === talent.id && h.type === "AWARD").map(h => h.data);
      });
    };

    attachHistory(gameState.marketDirectors);
    attachHistory(gameState.ownedDirectors);
    attachHistory(gameState.retiredDirectors);
    attachHistory(gameState.marketActors);
    attachHistory(gameState.ownedActors);
    attachHistory(gameState.retiredActors);
  }

  processDirectorAwards(gameState, studio);
  processActorAwards(gameState, studio);
  processCrewProgression(gameState);

  // 9. Production events — movie-level crises & opportunities.
  await processProductionEvents(gameState, studio);

  // 10. Random events — global industry events last so they react to the
  //     week's financial activity.
  const firedEvents = processRandomEvents(gameState, studio);
  if (firedEvents && firedEvents.length > 0) {
    for (const ev of firedEvents) {
      await generateNewsFromEvent(ev.label, ev.message, gameState.currentWeek);
    }
  }

  await processMerchandiseSales(gameState);
  await processStreamingPlatformGrowth(gameState);

  if (gameState.currentWeek > 0 && gameState.currentWeek % 52 === 0) {
    await processAnnualAwards(gameState);
  }

  // Recurring weekly streaming revenue for accepted deals (issue #41) — runs
  // after platform growth so royalties reflect this week's platform popularity.
  await processStreamingRevenue(gameState, studio);

  // Auto-release movies whose scheduled release week has arrived (issue #191)
  await processScheduledReleases(gameState.currentWeek);

  // Process film festival results for this week (issue #190)
  await processFestivalResults(gameState.currentWeek, studio);

  return { gameState, rivalReleases };
};



