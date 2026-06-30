export const addTalentHistory = (gameState, talentId, type, data) => {
  if (!gameState._pendingTalentHistories) {
    gameState._pendingTalentHistories = [];
  }
  gameState._pendingTalentHistories.push({
    gameStateId: gameState._id,
    talentId,
    type,
    data,
    createdAt: new Date(),
  });
};
