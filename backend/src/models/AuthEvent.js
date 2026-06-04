import mongoose from "mongoose";

const authEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILURE",
        "LOGOUT",
        "TOKEN_REFRESH_SUCCESS",
        "TOKEN_REFRESH_FAILURE",
        "AUTH_FAILURE",
        "SESSION_EXPIRED",
      ],
      index: true,
    },
    reason: {
      type: String,
      default: "",
    },
    identifier: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

authEventSchema.index({ user: 1, createdAt: -1 });

const AuthEvent = mongoose.model("AuthEvent", authEventSchema);

export default AuthEvent;
