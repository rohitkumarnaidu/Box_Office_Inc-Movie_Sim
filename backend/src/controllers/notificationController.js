import GameState from "../models/GameState.js";

export const getNotifications = async (req, res) => {
  const gameState = await GameState.findOne({
    user: req.user._id,
  });

  res.json({
    notifications: gameState.notifications,
  });
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;

  const gameState = await GameState.findOne({
    user: req.user._id,
  });

  const notification = gameState.notifications.id(id);

  if (!notification) {
    return res.status(404).json({
      message: "Notification not found",
    });
  }

  notification.read = true;

  await gameState.save();

  res.json({
    message: "Notification marked as read",
  });
};

export const markAllNotificationsRead = async (req, res) => {
  const gameState = await GameState.findOne({
    user: req.user._id,
  });

  gameState.notifications.forEach((notification) => {
    notification.read = true;
  });

  await gameState.save();

  res.json({
    message: "All notifications marked as read",
  });
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  const gameState = await GameState.findOne({
    user: req.user._id,
  });

  gameState.notifications = gameState.notifications.filter(
    (notification) => notification._id.toString() !== id
  );

  await gameState.save();

  res.json({
    message: "Notification deleted",
  });
};

export const deleteAllNotifications = async (req, res) => {
  const gameState = await GameState.findOne({
    user: req.user._id,
  });

  gameState.notifications = [];

  await gameState.save();

  res.json({
    message: "All notifications deleted",
  });
};
