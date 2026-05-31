export const calculateRarity = ({
  quality,
  originality,
  audienceAppeal,
  franchisePotential,
}) => {
  const average =
    (quality + originality + audienceAppeal + franchisePotential) / 4;

  if (average >= 95) return "Legendary";
  if (average >= 90) return "Epic";
  if (average >= 80) return "Rare";
  if (average >= 70) return "Uncommon";

  return "Common";
};
