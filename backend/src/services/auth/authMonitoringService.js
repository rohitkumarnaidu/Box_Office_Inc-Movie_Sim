import AuthEvent from "../../models/AuthEvent.js";

export const AUTH_EVENTS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  TOKEN_REFRESH_SUCCESS: "TOKEN_REFRESH_SUCCESS",
  TOKEN_REFRESH_FAILURE: "TOKEN_REFRESH_FAILURE",
  AUTH_FAILURE: "AUTH_FAILURE",
  SESSION_EXPIRED: "SESSION_EXPIRED",
};

const getRequestIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "";

export const recordAuthEvent = async (
  req,
  { user = null, eventType, reason = "", identifier = "", metadata = {} },
) => {
  try {
    await AuthEvent.create({
      user,
      eventType,
      reason,
      identifier,
      metadata,
      ipAddress: getRequestIp(req),
      userAgent: req.get("user-agent") || "",
    });
  } catch (error) {
    console.error("Failed to record auth event", error);
  }
};

export const getAuthDiagnosticsForUser = async (userId, limit = 50) => {
  const boundedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const events = await AuthEvent.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(boundedLimit)
    .lean();

  const summary = events.reduce(
    (acc, event) => {
      acc.total += 1;
      acc.byType[event.eventType] = (acc.byType[event.eventType] || 0) + 1;

      if (event.reason) {
        acc.byReason[event.reason] = (acc.byReason[event.reason] || 0) + 1;
      }

      return acc;
    },
    { total: 0, byType: {}, byReason: {} },
  );

  return {
    summary,
    events,
  };
};
