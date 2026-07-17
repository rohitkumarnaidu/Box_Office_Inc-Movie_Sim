export const SOUNDTRACK_TIERS = {
  PUBLIC_DOMAIN: {
    id: "PUBLIC_DOMAIN",
    name: "Public Domain",
    cost: 0,
    qualityBoost: 0,
    hypeBoost: 0,
    baseWeeklyRevenue: 0,
  },
  INDIE: {
    id: "INDIE",
    name: "Indie Artists",
    cost: 50000,
    qualityBoost: 5,
    hypeBoost: 5,
    baseWeeklyRevenue: 2000,
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium / Famous Bands",
    cost: 250000,
    qualityBoost: 12,
    hypeBoost: 15,
    baseWeeklyRevenue: 8000,
  },
};

/**
 * Calculate the effective quality boost based on movie genres.
 * Romance and Action get a higher boost from premium/indie soundtracks.
 */
export const getSoundtrackBoosts = (tierId, genres = []) => {
  const tier = SOUNDTRACK_TIERS[tierId] || SOUNDTRACK_TIERS.PUBLIC_DOMAIN;
  let qualityBoost = tier.qualityBoost;
  let hypeBoost = tier.hypeBoost;

  if (tierId !== "PUBLIC_DOMAIN") {
    const hasSpecialGenre = genres.some((g) =>
      ["Romance", "Action", "Musical"].includes(g)
    );
    if (hasSpecialGenre) {
      qualityBoost += 5; // Genre affinity bonus
      hypeBoost += 5;
    }
  }

  return { qualityBoost, hypeBoost };
};
