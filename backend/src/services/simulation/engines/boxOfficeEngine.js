const getVerdict = (roi) => {
  if (roi < -0.5) return "DISASTER";
  if (roi < 0) return "FLOP";
  if (roi <= 0.25) return "AVERAGE";
  if (roi <= 1.0) return "HIT";
  if (roi <= 3.0) return "BLOCKBUSTER";
  return "LEGENDARY";
};

export const generateBoxOffice = (movie, leadActor, director, marketMultiplier = 1) => {
  const qualityFactor = movie.quality / 100;
  const criticFactor = movie.criticScore / 100;
  const audienceFactor = movie.audienceScore / 100;
  const hypeFactor = movie.hype / 100;

  // Base potential based on hype and quality
  const basePotential = (hypeFactor * 0.6) + (qualityFactor * 0.4);

  // Opening Weekend influenced heavily by Hype and Actor Popularity
  const openingBase = 1000000; // 1M base
  const starPower = (leadActor.popularity / 100) * 500000;
  const marketingBoost = (movie.marketingBudget / 2);

  // Market Trends multiplier (defaults to 1 = no active trend for this
  // movie's genre). Applied at the opening weekend so it propagates through
  // worldwide gross, profit, ROI, and verdict.
  const openingWeekend = Math.round(
    (openingBase + starPower + marketingBoost) * (hypeFactor + 0.5) * (0.8 + Math.random() * 0.4) * marketMultiplier
  );

  // Worldwide Gross influenced by Audience Score (legs) and Critic Score (prestige)
  // Legs factor: high audience score means movie stays in theaters longer
  const legs = (audienceFactor * 4) + (criticFactor * 1);
  const worldwideGross = Math.round(openingWeekend * (2 + legs) * (0.9 + Math.random() * 0.2));

  const domesticGross = Math.round(worldwideGross * 0.45);
  const internationalGross = worldwideGross - domesticGross;

  const totalBudget = (movie.budget || 0) + (movie.marketingBudget || 0);
  // Instruction: profit = worldwideGross - productionBudget - marketingBudget
  // Note: Usually studios only get ~50% of box office, but following instructions literally for profit calc
  const profit = worldwideGross - totalBudget;
  const roi = totalBudget > 0 ? profit / totalBudget : worldwideGross / 1000000; // Fallback if budget 0

  return {
    openingWeekend,
    domesticGross,
    internationalGross,
    worldwideGross,
    boxOffice: worldwideGross,
    profit,
    roi,
    verdict: getVerdict(roi)
  };
};
