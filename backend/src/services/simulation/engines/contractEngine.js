/**
 * @fileoverview Contract Simulation Engine
 * 
 * Logic for contract evaluation, backend royalty payouts, buyout calculations,
 * and counter-offer generation for talent deals.
 */

/**
 * Evaluates whether a talent accepts a proposed contract based on upfront fee,
 * royalty percentage, and talent popularity/demands.
 * 
 * @param {object} proposal - Proposed terms (upfrontFee, backendRoyaltyPercentage).
 * @param {number} talentPopularity - Popularity score (0-100).
 * @returns {object} Evaluation result { accepted: boolean, score: number, counterOffer?: object }
 */
export const evaluateContractOffer = (proposal, talentPopularity) => {
  const upfront = proposal.upfrontFee || 0;
  const royalty = proposal.backendRoyaltyPercentage || 0;
  
  // Base expectation scales with talent popularity
  const expectedUpfront = Math.max(100000, talentPopularity * 25000);
  const upfrontRatio = upfront / expectedUpfront;
  const royaltyValueScore = (royalty * 0.1); // Each % royalty offsets upfront requirement

  const totalScore = upfrontRatio + royaltyValueScore;

  if (totalScore >= 1.0) {
    return { accepted: true, score: totalScore };
  }

  // Generate counter-offer if close
  if (totalScore >= 0.75) {
    return {
      accepted: false,
      score: totalScore,
      counterOffer: {
        upfrontFee: Math.round(expectedUpfront * 0.95),
        backendRoyaltyPercentage: Math.max(royalty, 5),
      },
    };
  }

  return { accepted: false, score: totalScore };
};

/**
 * Calculates backend royalty payout from box office gross.
 * 
 * @param {number} boxOfficeGross - Total box office revenue.
 * @param {number} royaltyPercentage - Contract royalty percentage.
 * @returns {number} Royalty payout amount in INR.
 */
export const calculateBackendRoyalty = (boxOfficeGross, royaltyPercentage) => {
  if (!boxOfficeGross || !royaltyPercentage) return 0;
  const clampedPercentage = Math.min(25, Math.max(0, royaltyPercentage));
  return Math.round((boxOfficeGross * clampedPercentage) / 100);
};

/**
 * Calculates contract buyout penalty fee for early termination.
 * 
 * @param {number} upfrontFee - Original contract fee.
 * @param {number} remainingWeeks - Exclusivity weeks remaining.
 * @returns {number} Buyout fee in INR.
 */
export const calculateBuyoutPenalty = (upfrontFee, remainingWeeks) => {
  const baseFee = upfrontFee * 0.5;
  const remainingFactor = Math.max(1, remainingWeeks) * 0.1;
  return Math.round(baseFee * (1 + remainingFactor));
};
