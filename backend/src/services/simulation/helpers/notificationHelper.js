export const addNotification = (gameState, message) => {
  gameState.notifications.push({
    message,
    createdAt: new Date(),
  });
};
