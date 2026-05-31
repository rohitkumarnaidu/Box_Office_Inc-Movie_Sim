export const calculateWriterRarity = ({
  originality,
  consistency,
  reliability,
}) => {
  const average = (originality + consistency + reliability) / 3;

  if (average >= 95) return "Legendary";

  if (average >= 88) return "Epic";

  if (average >= 78) return "Rare";

  if (average >= 68) return "Uncommon";

  return "Common";
};
