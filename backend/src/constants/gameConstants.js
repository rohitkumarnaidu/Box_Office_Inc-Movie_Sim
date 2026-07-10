export const SPY_COST = 100000;

export const AWARDS_CAMPAIGN_COST = 1000000;
export const AWARDS_CAMPAIGN_PRESTIGE_GAIN = 15;

export const MERCH_BOOST_COST = 2500000;

export const BOOTCAMPS = {
  acting_masterclass: { name: "Acting Masterclass", cost: 500000, stat: "actingSkill", boost: 5, target: "actor" },
  media_training: { name: "Media Training", cost: 200000, stat: "reputation", boost: 5, target: "any" },
  directing_workshop: { name: "Directing Workshop", cost: 500000, stat: "creativity", boost: 5, target: "director" },
  leadership_bootcamp: { name: "Leadership Bootcamp", cost: 300000, stat: "leadership", boost: 5, target: "director" },
};

export const STUDIO_UPGRADES = {
  marketing_partnership: { name: "Marketing Partnership", cost: 2000000, description: "Establishes a permanent partnership with a leading agency. Hype and promotional effectiveness boosted permanently.", prestigeGain: 25 },
  advanced_cameras: { name: "Advanced Camera Gear", cost: 1500000, description: "Equip your director and crew with cutting-edge 8K cameras. Boosts future film quality.", prestigeGain: 25 },
  talent_access: { name: "Talent Agency Access", cost: 3000000, description: "Unlocks priority access to rare writers, directors, and actors.", prestigeGain: 25 },
};

export const LOAN_TIERS = {
  SMALL: { amount: 500000, interestRate: 0.08, weeks: 26 },
  MEDIUM: { amount: 1000000, interestRate: 0.12, weeks: 52 },
  LARGE: { amount: 2000000, interestRate: 0.18, weeks: 78 },
};

export const MAX_ACTIVE_LOANS = 3;

export const PRODUCTION_WEEKS = {
  PRE_PRODUCTION: 4,
  PRODUCTION: 10,
  POST_PRODUCTION: 6,
  TOTAL: 20,
};

export const QUALITY_WEIGHTS = {
  SCRIPT: 0.35,
  DIRECTOR_CREATIVITY: 0.25,
  LEAD_ACTOR_SKILL: 0.20,
  CREW_TECHNICAL: 0.20,
};

export const HYPE_WEIGHTS = {
  ACTOR_POPULARITY: 0.4,
  DIRECTOR_REPUTATION: 0.3,
  MARKETING: 0.3,
};

export const VERDICT_THRESHOLDS = {
  DISASTER: 0,
  FLOP: 20,
  AVERAGE: 40,
  HIT: 60,
  BLOCKBUSTER: 75,
  ALL_TIME_BLOCKBUSTER: 90,
};
