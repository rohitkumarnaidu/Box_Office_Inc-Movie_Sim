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
export const processLoanRepayments = (studio, gameState, addNotification) => {
  if (!studio.loans || studio.loans.length === 0) {
    // No loans: if positive balance, reset negativeCashWeeks
    if (studio.money >= 0) studio.negativeCashWeeks = 0;
    return;
  }

  const notifications = [];
  const paidOffLoans = [];

  for (const loan of studio.loans) {
    const payment = Math.min(loan.weeklyRepayment, studio.money + loan.weeklyRepayment); // pay what we can
    studio.money -= payment;
    loan.weeksRemaining -= 1;

    if (loan.weeksRemaining <= 0) {
      paidOffLoans.push(loan);
      const msg = `Loan of $${loan.amount.toLocaleString()} fully repaid.`;
      notifications.push(msg);
      addNotification(gameState, { type: "LOAN", message: msg, week: gameState.currentWeek });
    }
  }

  // Remove paid-off loans
  studio.loans = studio.loans.filter(l => l.weeksRemaining > 0);

  // Track negative balance streak
  if (studio.money < 0) {
    studio.negativeCashWeeks = (studio.negativeCashWeeks || 0) + 1;

    if (studio.negativeCashWeeks >= 4 && !studio.isBankrupt) {
      studio.isBankrupt = true;
      const bankruptMsg = "BANKRUPTCY DECLARED: Your studio has been insolvent for 4 consecutive weeks.";
      notifications.push(bankruptMsg);
      addNotification(gameState, { type: "BANKRUPTCY", message: bankruptMsg, week: gameState.currentWeek });
    }
  } else {
    studio.negativeCashWeeks = 0;
  }

  return notifications;
};
