import { processWriterPayroll } from "./payrollEngine.js";
import { processWritingProjects } from "./writerEngine.js";

import { processWriterAging } from "../helpers/agingHelper.js";

export const processWeeklyTick = async (gameState, studio) => {
  processWriterPayroll(gameState, studio);

  await processWritingProjects(gameState, studio);

  processWriterAging(gameState);

  return gameState;
};

export default processWeeklyTick;
