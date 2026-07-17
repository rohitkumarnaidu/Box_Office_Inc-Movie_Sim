import Studio from "../models/Studio.js";
import env from "../config/envConfig.js";

const BANKRUPTCY_CONCURRENT_WEEKS = env.BANKRUPTCY_THRESHOLD_WEEKS;

export const checkNegativeBalance = async (req, res, next) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) return next();

    if (studio.isBankrupt) {
      return res.status(400).json({
        success: false,
        code: "STUDIO_BANKRUPT",
        message: "Your studio has declared bankruptcy. Restructure your finances before performing this action.",
      });
    }

    if (studio.negativeCashWeeks >= BANKRUPTCY_CONCURRENT_WEEKS - 1) {
      return res.status(400).json({
        success: false,
        code: "PENDING_BANKRUPTCY",
        message: `Your studio has been in negative balance for ${studio.negativeCashWeeks} weeks. One more week will trigger bankruptcy.`,
      });
    }

    if (studio.money < 0) {
      return res.status(400).json({
        success: false,
        code: "NEGATIVE_BALANCE",
        message: "Your studio is in negative balance. Clear your debt before performing this action.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
