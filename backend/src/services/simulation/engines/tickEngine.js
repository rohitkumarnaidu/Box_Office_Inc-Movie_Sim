import { processWritingProjects } from "./writerEngine.js";

import { processWriterAging } from "../helpers/agingHelper.js";

export const processWeeklyTick = async (gameState) => {
  gameState.currentWeek += 1;

  await processWritingProjects(gameState);

  processWriterAging(gameState);

  return gameState;
};

export default processWeeklyTick;
