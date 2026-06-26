import GameState from "../models/GameState.js";
import Notification from "../models/Notification.js";

const findUserGameState = async (userId) => {
  const gameState = await GameState.findOne({
    user: userId,
  });

  return gameState;
};

const sendGameStateNotFound = (res) =>
  res.status(404).json({
    message: "Game state not found",
  });

export const getNotifications = async (req, res) => {
  const gameState = await findUserGameState(req.user._id);

  if (!gameState) {
    return sendGameStateNotFound(res);
  }

  const notifications = await Notification.find({ gameStateId: gameState._id }).sort({ createdAt: -1 });
  const unreadCount = await Notification.countDocuments({ gameStateId: gameState._id, read: false });

  res.json({
    notifications,
    unreadCount,
  });
};

export const getUnreadNotificationCount = async (req, res) => {
  const gameState = await findUserGameState(req.user._id);

  if (!gameState) {
    return sendGameStateNotFound(res);
  }

  const unreadCount = await Notification.countDocuments({ gameStateId: gameState._id, read: false });

  res.json({
    unreadCount,
  });
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;

  const gameState = await findUserGameState(req.user._id);

  if (!gameState) {
    return sendGameStateNotFound(res);
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, gameStateId: gameState._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      message: "Notification not found",
    });
  }

  const unreadCount = await Notification.countDocuments({ gameStateId: gameState._id, read: false });

  res.json({
    message: "Notification marked as read",
    unreadCount,
  });
};

export const markAllNotificationsRead = async (req, res) => {
  const gameState = await findUserGameState(req.user._id);

  if (!gameState) {
    return sendGameStateNotFound(res);
  }

  await Notification.updateMany({ gameStateId: gameState._id }, { read: true });

  const unreadCount = await Notification.countDocuments({ gameStateId: gameState._id, read: false });

  res.json({
    message: "All notifications marked as read",
    unreadCount,
  });
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  const gameState = await findUserGameState(req.user._id);

  if (!gameState) {
    return sendGameStateNotFound(res);
  }

  const notification = await Notification.findOneAndDelete({ _id: id, gameStateId: gameState._id });

  if (!notification) {
    return res.status(404).json({
      message: "Notification not found",
    });
  }

  const unreadCount = await Notification.countDocuments({ gameStateId: gameState._id, read: false });

  res.json({
    message: "Notification deleted",
    unreadCount,
  });
};

export const deleteAllNotifications = async (req, res) => {
  const gameState = await findUserGameState(req.user._id);

  if (!gameState) {
    return sendGameStateNotFound(res);
  }

  const result = await Notification.deleteMany({ gameStateId: gameState._id });

  res.json({
    message: "All notifications deleted",
    deletedCount: result.deletedCount,
    unreadCount: 0,
  });
};
