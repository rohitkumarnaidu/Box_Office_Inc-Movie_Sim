export const addNotification = (gameState, message, type = "SYSTEM") => {
  gameState.notifications.unshift({
    message,
    type,
    read: false,
    createdAt: new Date(),
  });
};

export const unreadCount = (notifications) => {
  return notifications.filter((notification) => !notification.read).length;
};
