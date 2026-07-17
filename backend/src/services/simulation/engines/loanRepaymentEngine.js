/**
 * @fileoverview Loan Repayment Engine
 *
 * Processes weekly loan repayments for all active studio loans.
 * Runs during every weekly simulation tick after payroll.
 *
 * Behavior:
 *  - Each active loan has its `weeklyRepayment` deducted from studio funds.
 *  - `weeksRemaining` is decremented; fully repaid loans are removed.
 *  - If the studio's money goes negative after repayment:
 *    - `negativeCashWeeks` is incremented.
 *    - At 4 consecutive weeks in the negative: studio is flagged `isBankrupt = true`.
 *  - If the studio's money is positive, `negativeCashWeeks` resets to 0.
 *
 * @param {object} studio       - Studio Mongoose document (mutated in place).
 * @param {object} gameState    - GameState document (used for currentWeek in notifications).
 * @param {Function} addNotification - Notification helper.
 * @returns {string[]} Notification messages generated this tick.
 */
import env from "../../../config/envConfig.js";

const BANKRUPTCY_CONCURRENT_WEEKS = env.BANKRUPTCY_THRESHOLD_WEEKS;

export const processLoanRepayments = (studio, gameState, addNotification) => {
  const notifications = [];

  if (!studio.loans || studio.loans.length === 0) {
    if (studio.money >= 0) {
      studio.negativeCashWeeks = 0;
      if (studio.isBankrupt && studio.money > 0) {
        studio.isBankrupt = false;
        const msg = "Bankruptcy status cleared. Studio is back in good standing.";
        notifications.push(msg);
        addNotification(gameState, { type: "FINANCIAL", message: msg, week: gameState.currentWeek });
      }
    }
    return notifications;
  }

  const paidOffLoans = [];

  for (const loan of studio.loans) {
    const actualPayment = Math.min(loan.weeklyRepayment, Math.max(0, studio.money + loan.weeklyRepayment));
    studio.money -= actualPayment;
    loan.weeksRemaining -= 1;

    if (loan.weeksRemaining <= 0) {
      paidOffLoans.push(loan);
      const msg = `Loan of $${loan.amount.toLocaleString()} fully repaid.`;
      notifications.push(msg);
      addNotification(gameState, { type: "LOAN", message: msg, week: gameState.currentWeek });
    }
  }

  studio.loans = studio.loans.filter(l => l.weeksRemaining > 0);

  if (studio.money < 0) {
    studio.negativeCashWeeks = (studio.negativeCashWeeks || 0) + 1;

    if (studio.negativeCashWeeks >= BANKRUPTCY_CONCURRENT_WEEKS && !studio.isBankrupt) {
      studio.isBankrupt = true;
      const bankruptMsg = "BANKRUPTCY DECLARED: Your studio has been insolvent for 4 consecutive weeks.";
      notifications.push(bankruptMsg);
      addNotification(gameState, { type: "BANKRUPTCY", message: bankruptMsg, week: gameState.currentWeek });
    }

    if (studio.negativeCashWeeks % 2 === 0) {
      const warningMsg = `WARNING: Studio has been in negative balance for ${studio.negativeCashWeeks} weeks. Bankruptcy in ${Math.max(0, BANKRUPTCY_CONCURRENT_WEEKS - studio.negativeCashWeeks)} weeks if unresolved.`;
      notifications.push(warningMsg);
      addNotification(gameState, { type: "WARNING", message: warningMsg, week: gameState.currentWeek });
    }
  } else {
    if (studio.negativeCashWeeks > 0) {
      const recoveryMsg = `Studio finances recovered after ${studio.negativeCashWeeks} weeks in the red. Negative balance streak reset.`;
      notifications.push(recoveryMsg);
      addNotification(gameState, { type: "FINANCIAL", message: recoveryMsg, week: gameState.currentWeek });
    }

    studio.negativeCashWeeks = 0;

    if (studio.isBankrupt && studio.money > 0) {
      studio.isBankrupt = false;
      const msg = "Bankruptcy status cleared. Studio finances are now positive.";
      notifications.push(msg);
      addNotification(gameState, { type: "FINANCIAL", message: msg, week: gameState.currentWeek });
    }
  }

  return notifications;
};
