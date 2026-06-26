export const addNotification = (gameState, message) => {
  if (!gameState._pendingNotifications) {
    gameState._pendingNotifications = [];
  }
  gameState._pendingNotifications.push({
    gameStateId: gameState._id,
    type: "SYSTEM",
    message,
    read: false,
    createdAt: new Date(),
  });
};
