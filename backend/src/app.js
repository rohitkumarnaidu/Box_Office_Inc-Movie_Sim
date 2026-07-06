import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";

import env from "./config/envConfig.js";

import loanRoutes from "./routes/loanRoutes.js";
import talentRoutes from "./routes/talentRoutes.js";
import merchRoutes from "./routes/merchRoutes.js";
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

import errorHandler from "./middleware/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Box-Office-Inc API Running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/scripts", scriptRoutes);
app.use("/api/writers", writersRoutes);
app.use("/api/upgrades", upgradesRoutes);
app.use("/api/directors", directorRoutes);
app.use("/api/actors", actorsRoutes);
app.use("/api/academy", academyRoutes);
app.use("/api/crew", crewRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/awards-campaign", awardsCampaignRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/franchises", franchiseRoutes);
app.use("/api/streaming", streamingRoutes);
app.use("/api/tv-shows", tvShowRoutes);
app.use("/api/rival-studios", rivalsRoutes);
app.use("/api/spy", spyRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/studios/loans", loanRoutes);
app.use("/api/talent", talentRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/reviews", reviewDashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use(errorHandler);

export default app;
