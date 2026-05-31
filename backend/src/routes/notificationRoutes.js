import express from "express";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.patch("/:id/read", protect, markNotificationRead);

router.patch("/read-all", protect, markAllNotificationsRead);

router.delete("/:id", protect, deleteNotification);

router.delete("/", protect, deleteAllNotifications);

export default router;
