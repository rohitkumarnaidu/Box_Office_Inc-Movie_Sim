/**
 * @fileoverview Loan Controller
 *
 * Handles corporate loan management for studios (issue #195).
 *
 * Loan tiers:
 *  - SMALL:  $500,000  at 8% annual interest over 26 weeks
 *  - MEDIUM: $1,000,000 at 12% annual interest over 52 weeks
 *  - LARGE:  $2,000,000 at 18% annual interest over 78 weeks
 *
 * Weekly repayment = (principal + totalInterest) / weeksRemaining
 * Interest is pre-calculated and factored into repayment from the start.
 */

import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";
import { LOAN_TIERS, MAX_ACTIVE_LOANS } from "../constants/gameConstants.js";

/**
 * POST /api/studios/loans/take
 *
 * Request body: { tier: "SMALL" | "MEDIUM" | "LARGE" }
 */
export const takeLoan = async (req, res) => {
  try {
    const { tier } = req.body;

    if (!LOAN_TIERS[tier]) {
      return res.status(400).json({
        success: false,
        message: `Invalid loan tier. Choose one of: ${Object.keys(LOAN_TIERS).join(", ")}`,
      });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

    if (studio.isBankrupt) {
      return res.status(400).json({ success: false, message: "Bankrupt studios cannot take new loans." });
    }

    // Limit: no more than MAX_ACTIVE_LOANS active loans at once
    if ((studio.loans || []).length >= MAX_ACTIVE_LOANS) {
      return res.status(400).json({ success: false, message: "Maximum of 3 active loans allowed at one time." });
    }

    const gameState = await GameState.findOne({ user: req.user._id });
    if (!gameState) return res.status(404).json({ success: false, message: "Game state not found" });

    const loanConfig = LOAN_TIERS[tier];
    const totalInterest = loanConfig.amount * loanConfig.interestRate * (loanConfig.weeks / 52);
    const totalRepayment = loanConfig.amount + totalInterest;
    const weeklyRepayment = Math.ceil(totalRepayment / loanConfig.weeks);

    studio.loans.push({
      amount: loanConfig.amount,
      interestRate: loanConfig.interestRate,
      weeklyRepayment,
      weeksRemaining: loanConfig.weeks,
      takenWeek: gameState.currentWeek,
    });

    studio.money += loanConfig.amount;
    await studio.save();

    res.status(201).json({
      success: true,
      message: `Loan of $${loanConfig.amount.toLocaleString()} approved at ${(loanConfig.interestRate * 100).toFixed(0)}% annual interest.`,
      weeklyRepayment,
      weeksRemaining: loanConfig.weeks,
      newBalance: studio.money,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/studios/loans
 *
 * Returns all active loans for the studio.
 */
export const getLoans = async (req, res) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id }).select("loans money isBankrupt negativeCashWeeks").lean();
    if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

    const totalWeeklyDebt = (studio.loans || []).reduce((sum, l) => sum + l.weeklyRepayment, 0);

    res.status(200).json({
      success: true,
      loans: studio.loans || [],
      totalWeeklyDebt,
      isBankrupt: studio.isBankrupt || false,
      negativeCashWeeks: studio.negativeCashWeeks || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
