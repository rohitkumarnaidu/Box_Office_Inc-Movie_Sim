import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { takeLoan, getLoans } from "../controllers/loanController.js";

const router = express.Router();

router.get("/", protect, getLoans);
router.post("/take", protect, takeLoan);

export default router;
