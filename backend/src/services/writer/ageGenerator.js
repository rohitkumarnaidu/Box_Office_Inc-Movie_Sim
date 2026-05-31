const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateWriterAge = () => {
  const roll = Math.random() * 100;

  if (roll < 20) {
    return randomBetween(18, 30);
  }

  if (roll < 90) {
    return randomBetween(31, 60);
  }

  return randomBetween(61, 90);
};
