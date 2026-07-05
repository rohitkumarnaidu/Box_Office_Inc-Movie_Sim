import express from "express";
import { getNews, getNewsDetail } from "../controllers/newsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNews);
router.get("/:id", protect, getNewsDetail);

export default router;
