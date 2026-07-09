import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
const app = express();

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

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

// Apply the rate limiter to all API routes
app.use("/api", limiter);
/*
|--------------------------------------------------------------------------
| Health Route
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Box-Office-Inc API Running",
  });
});

/*
|--------------------------------------------------------------------------
| Not Found
|--------------------------------------------------------------------------
*/

// Routes
import authRoutes from "./routes/authRoutes.js";
import scriptRoutes from "./routes/scriptRoutes.js";
import writerRoutes from "./routes/writerRoutes.js";
import directorRoutes from "./routes/directorRoutes.js";
import actorRoutes from "./routes/actorRoutes.js";
import crewRoutes from "./routes/crewRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import franchiseRoutes from "./routes/franchiseRoutes.js";
import streamingRoutes from "./routes/streamingRoutes.js";
import rivalStudioRoutes from "./routes/rivalStudioRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/scripts", scriptRoutes);
app.use("/api/writers", writerRoutes);
app.use("/api/directors", directorRoutes);
app.use("/api/actors", actorRoutes);
app.use("/api/crew", crewRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/franchises", franchiseRoutes);
app.use("/api/streaming", streamingRoutes);
app.use("/api/rival-studios", rivalStudioRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use(errorHandler);

export default app;
