export const calculateWriterSalary = ({
  originality,
  consistency,
  reliability,
  reputation,
}) => {
  const score =
    originality * 0.4 +
    consistency * 0.3 +
    reliability * 0.2 +
    reputation * 0.1;

  return Math.round(score * 2500);
};
