import GameState from "../../models/GameState.js";

import processWeeklyTick from "./engines/tickEngine.js";

const runWeeklySimulation = async (userId) => {
  const gameState = await GameState.findOne({
    user: userId,
  });

  if (!gameState) {
    throw new Error("Game state not found");
  }

  await processWeeklyTick(gameState);

  await gameState.save();

  return gameState;
};

export default runWeeklySimulation;
