import mongoose from "mongoose";

/**
 * Helper utility to run a block of code within a MongoDB transaction.
 * Automatically handles starting the session, committing, and rolling back on failure.
 *
 * @param {Function} fn - Async function to execute. Receives the `session` object as an argument.
 * @returns {Promise<any>} - The result of the provided function.
 */
export const withTransaction = async (fn, maxRetries = 5, baseDelay = 50) => {
  let attempts = 0;

  while (true) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      // Execute the passed operations using this session
      const result = await fn(session);
      
      // If operations succeed, attempt to commit
      await session.commitTransaction();
      return result;
      
    } catch (error) {
      // Always abort the current transaction on error before assessing retries
      await session.abortTransaction();

      const isTransient = error.errorLabels && error.errorLabels.includes('TransientTransactionError');
      attempts++;

      if (isTransient && attempts < maxRetries) {
        // Calculate exponential backoff with a bit of jitter (randomness) to avoid thundering herd problem
        const delay = Math.pow(2, attempts) * baseDelay + Math.random() * 20;
        console.warn(`[Transaction] WriteConflict or Transient error encountered. Retry attempt ${attempts}/${maxRetries} after ${Math.round(delay)}ms...`);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue; // Re-run the while loop with a fresh session
      }

      // If it's not a transient error, or we exhausted our retries, throw it up the chain
      throw error;
      
    } finally {
      // Ensure the session is always closed to prevent connection/memory leaks
      session.endSession();
    }
  }
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
