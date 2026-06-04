const clampMultiplier = (value, min, max) => Math.min(max, Math.max(min, value));

export const calculatePlayerWrittenScriptSellPrice = ({
  script,
  writerReputation = 0,
  awards = 0,
}) => {
  const basePrice = Number(script.price || 0);

  if (basePrice <= 0) {
    return 0;
  }

  const qualityMultiplier = 0.5 + Number(script.quality || 0) / 200;
  const reputationMultiplier = 0.85 + Number(writerReputation || 0) / 400;
  const awardMultiplier = 1 + Number(awards || 0) * 0.08;
  const franchiseMultiplier = 0.9 + Number(script.franchisePotential || 0) / 500;

  const finalMultiplier = clampMultiplier(
    qualityMultiplier *
      reputationMultiplier *
      awardMultiplier *
      franchiseMultiplier,
    0.35,
    1.8
  );

  return Math.round(basePrice * finalMultiplier);
};

export const calculateFallbackScriptSellPrice = (script) => {
  const existingSellPrice = Number(script.sellPrice || 0);

  if (existingSellPrice > 0) {
    return existingSellPrice;
  }

  return calculatePlayerWrittenScriptSellPrice({
    script,
  });
};
