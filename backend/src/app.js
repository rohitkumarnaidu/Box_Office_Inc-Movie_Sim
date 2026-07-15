import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";

import env from "./config/envConfig.js";
import requestIdMiddleware from "./middleware/requestIdMiddleware.js";
import errorHandler from "./middleware/errorMiddleware.js";

import marketingRoutes from "./routes/marketingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import scriptRoutes from "./routes/scriptRoutes.js";
import writersRoutes from "./routes/writersRoutes.js";
import upgradesRoutes from "./routes/upgradesRoutes.js";
import directorRoutes from "./routes/directorRoutes.js";
import actorsRoutes from "./routes/actorsRoutes.js";
import academyRoutes from "./routes/academyRoutes.js";
import crewRoutes from "./routes/crewRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import awardsCampaignRoutes from "./routes/awardsCampaignRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import franchiseRoutes from "./routes/franchiseRoutes.js";
import reviewDashboardRoutes from "./routes/reviewDashboardRoutes.js";
import streamingRoutes from "./routes/streamingRoutes.js";
import tvShowRoutes from "./routes/tvShowRoutes.js";
import rivalsRoutes from "./routes/rivalsRoutes.js";
import spyRoutes from "./routes/spyRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import studioRoutes from "./routes/studioRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import merchRoutes from "./routes/merchRoutes.js";

const app = express();

const corsOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(",").map((s) => s.trim())
  : [];

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(requestIdMiddleware);
app.use(helmet());
app.use(morgan(env.LOG_LEVEL));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

// FIXED: Actually apply the limiter to the API, but skip it during testing so the CI doesn't crash!
if (process.env.NODE_ENV !== "test") {
  app.use("/api", limiter);
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Box-Office-Inc API Running",
    requestId: req.requestId,
  });
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/scripts", apiRateLimiter, scriptRoutes);
app.use("/api/writers", apiRateLimiter, writersRoutes);
app.use("/api/upgrades", apiRateLimiter, upgradesRoutes);
app.use("/api/directors", apiRateLimiter, directorRoutes);
app.use("/api/actors", apiRateLimiter, actorsRoutes);
app.use("/api/academy", apiRateLimiter, academyRoutes);
app.use("/api/crew", apiRateLimiter, crewRoutes);
app.use("/api/movies", apiRateLimiter, movieRoutes);
app.use("/api/simulation", simulationRateLimiter, simulationRoutes);
app.use("/api/notifications", apiRateLimiter, notificationsRoutes);
app.use("/api/awards-campaign", apiRateLimiter, awardsCampaignRoutes);
app.use("/api/news", apiRateLimiter, newsRoutes);
app.use("/api/franchises", apiRateLimiter, franchiseRoutes);
app.use("/api/streaming", apiRateLimiter, streamingRoutes);
app.use("/api/tv-shows", apiRateLimiter, tvShowRoutes);
app.use("/api/rival-studios", apiRateLimiter, rivalsRoutes);
app.use("/api/spy", apiRateLimiter, spyRoutes);
app.use("/api/leaderboard", apiRateLimiter, leaderboardRoutes);
app.use("/api/studios", apiRateLimiter, studioRoutes);
app.use("/api/studios/loans", apiRateLimiter, loanRoutes);
app.use("/api/marketing", apiRateLimiter, marketingRoutes);
app.use("/api/reviews", apiRateLimiter, reviewDashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: req.requestId,
  });
});

app.use(errorHandler);

export default app;
