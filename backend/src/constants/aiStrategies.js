export const AI_PERSONALITY_STRATEGIES = {
  BLOCKBUSTER: {
    label: "Blockbuster",
    description: "High budget, high risk, high reward. Focuses on big-budget genre films.",
    budgetMultiplier: 1.5,
    riskTolerance: 0.8,
    qualityFloor: 60,
    marketingSpendRatio: 0.3,
    genrePreferences: ["Action", "Adventure", "Sci-Fi", "Superhero"],
    productionSpeed: 0.8,
  },
  PRESTIGE: {
    label: "Prestige",
    description: "Quality-over-quantity. Focuses on awards-worthy dramas and critical acclaim.",
    budgetMultiplier: 1.2,
    riskTolerance: 0.4,
    qualityFloor: 75,
    marketingSpendRatio: 0.2,
    genrePreferences: ["Drama", "Historical", "Biopic", "Literary Adaptation"],
    productionSpeed: 1.0,
  },
  INDIE: {
    label: "Indie",
    description: "Low budget, high creativity. Niche films with strong cult followings.",
    budgetMultiplier: 0.5,
    riskTolerance: 0.6,
    qualityFloor: 50,
    marketingSpendRatio: 0.1,
    genrePreferences: ["Comedy", "Horror", "Thriller", "Experimental"],
    productionSpeed: 1.2,
  },
  COMMERCIAL: {
    label: "Commercial",
    description: "Balanced approach. Consistent mainstream releases with moderate budgets.",
    budgetMultiplier: 1.0,
    riskTolerance: 0.5,
    qualityFloor: 55,
    marketingSpendRatio: 0.25,
    genrePreferences: ["Comedy", "Romance", "Action", "Family"],
    productionSpeed: 1.0,
  },
  CHAOTIC: {
    label: "Chaotic",
    description: "Unpredictable. Random budgets and genres. Occasionally produces surprises.",
    budgetMultiplier: 1.0,
    riskTolerance: 0.9,
    qualityFloor: 30,
    marketingSpendRatio: 0.15,
    genrePreferences: [],
    productionSpeed: 1.1,
  },
};

export const AI_BUDGET_TIERS = {
  LOW: { min: 500000, max: 3000000, label: "Low" },
  MEDIUM: { min: 3000000, max: 15000000, label: "Medium" },
  HIGH: { min: 15000000, max: 50000000, label: "High" },
  BLOCKBUSTER: { min: 50000000, max: 200000000, label: "Blockbuster" },
};

export const AI_RELEASE_STRATEGIES = {
  WIDE: { theaters: 4000, marketingMultiplier: 1.3, label: "Wide Release" },
  MODERATE: { theaters: 2000, marketingMultiplier: 1.0, label: "Moderate Release" },
  LIMITED: { theaters: 500, marketingMultiplier: 0.6, label: "Limited Release" },
};

export const getAIStrategy = (personality) => {
  return AI_PERSONALITY_STRATEGIES[personality] || AI_PERSONALITY_STRATEGIES.COMMERCIAL;
};

export const getAIBudgetTier = (money) => {
  if (money >= 50000000) return AI_BUDGET_TIERS.BLOCKBUSTER;
  if (money >= 15000000) return AI_BUDGET_TIERS.HIGH;
  if (money >= 3000000) return AI_BUDGET_TIERS.MEDIUM;
  return AI_BUDGET_TIERS.LOW;
};

export const getAIReleaseStrategy = (personality) => {
  const strategy = AI_PERSONALITY_STRATEGIES[personality];
  if (!strategy) return AI_RELEASE_STRATEGIES.MODERATE;
  if (strategy.riskTolerance > 0.7) return AI_RELEASE_STRATEGIES.WIDE;
  if (strategy.riskTolerance < 0.5) return AI_RELEASE_STRATEGIES.LIMITED;
  return AI_RELEASE_STRATEGIES.MODERATE;
};
