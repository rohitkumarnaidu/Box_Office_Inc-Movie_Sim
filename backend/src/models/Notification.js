import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  gameStateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameState",
    required: true,
  },
  type: {
    type: String,
    default: "SYSTEM",
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
