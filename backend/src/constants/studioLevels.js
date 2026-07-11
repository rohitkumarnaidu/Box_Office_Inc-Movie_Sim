export const STUDIO_LEVELS = [
  { level: 1, label: "Independent", prestigeRequired: 0, maxFans: 1000, loanLimit: 1 },
  { level: 2, label: "Regional", prestigeRequired: 50, maxFans: 10000, loanLimit: 2 },
  { level: 3, label: "National", prestigeRequired: 150, maxFans: 100000, loanLimit: 3 },
  { level: 4, label: "Major", prestigeRequired: 300, maxFans: 500000, loanLimit: 4 },
  { level: 5, label: "Blockbuster", prestigeRequired: 500, maxFans: 2000000, loanLimit: 5 },
  { level: 6, label: "Empire", prestigeRequired: 800, maxFans: 10000000, loanLimit: 6 },
  { level: 7, label: "Legendary", prestigeRequired: 1200, maxFans: 50000000, loanLimit: 7 },
  { level: 8, label: "Iconic", prestigeRequired: 1800, maxFans: 200000000, loanLimit: 8 },
  { level: 9, label: "Global Giant", prestigeRequired: 2500, maxFans: 500000000, loanLimit: 9 },
  { level: 10, label: "Universal", prestigeRequired: 3500, maxFans: 1000000000, loanLimit: 10 },
];

export const PRESTIGE_PER_MILESTONE = {
  movieReleased: 5,
  hitMovie: 15,
  blockbuster: 30,
  awardWon: 50,
  franchiseEstablished: 20,
};

export const FANS_PER_MILESTONE = {
  movieReleased: 100,
  hitMovie: 500,
  blockbuster: 2000,
  awardWon: 5000,
  franchiseEstablished: 1000,
};

export const getStudioLevel = (prestige) => {
  let level = STUDIO_LEVELS[0];
  for (const l of STUDIO_LEVELS) {
    if (prestige >= l.prestigeRequired) {
      level = l;
    } else {
      break;
    }
  }
  return level;
};

export const getMaxFansForLevel = (prestige) => {
  const level = getStudioLevel(prestige);
  return level.maxFans;
};

export const getLoanLimitForLevel = (prestige) => {
  const level = getStudioLevel(prestige);
  return level.loanLimit;
};
