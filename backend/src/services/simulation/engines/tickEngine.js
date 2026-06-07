import { processDirectorAwards } from "../../director/directorAwardsService.js";
import { processDirectorAging } from "./directorEngine.js";
import { processDirectingProjects } from "./directingProjectEngine.js";
import { processProduction } from "./productionEngine.js";
import { processWriterPayroll } from "./payrollEngine.js";
import { processWritingProjects } from "./writerEngine.js";
import { processMarketTrends } from "./trendEngine.js";

import { addNotification } from "../helpers/notificationHelper.js";
import { processWriterAging } from "../helpers/agingHelper.js";

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

  return gameState;
};

export default processWeeklyTick;
