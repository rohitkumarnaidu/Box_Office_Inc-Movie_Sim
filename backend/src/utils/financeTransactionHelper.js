import mongoose from "mongoose";

/**
 * Helper utility to run a block of code within a MongoDB transaction.
 * Automatically handles starting the session, committing, and rolling back on failure.
 *
 * @param {Function} fn - Async function to execute. Receives the `session` object as an argument.
 * @returns {Promise<any>} - The result of the provided function.
 */
export const withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  let result;
  
  try {
    session.startTransaction();
    result = await fn(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
  
  return result;
};

/**
 * Helper to compute profit margin percentage.
 *
 * @param {number} revenue
 * @param {number} profit
 * @returns {string} - Margins formatted as percentage
 */
export const getProfitMargin = (revenue, profit) => {
  if (!revenue || revenue === 0) return "0.00%";
  const margin = (profit / revenue) * 100;
  return `${margin.toFixed(2)}%`;
};
