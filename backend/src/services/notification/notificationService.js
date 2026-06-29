export const addNotification = (gameState, message, type = "SYSTEM") => {
  if (!gameState._pendingNotifications) {
    gameState._pendingNotifications = [];
  }
  gameState._pendingNotifications.unshift({
    gameStateId: gameState._id,
    message,
    type,
    read: false,
    createdAt: new Date(),
  });
};

