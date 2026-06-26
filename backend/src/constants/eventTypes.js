// Random Event Types — data-driven catalogue for the Global Random Event Engine.
//
// Each event describes an occasional industry occurrence that can affect the
// studio. The catalogue is intentionally declarative so new events can be added
// by appending one object here — no engine changes required (issue #14:
// "New events can be added without major refactoring").
//
// Field reference:
//   id           unique key, used for cooldown tracking and de-duplication
//   label        human-readable name shown in notifications
//   category     "positive" | "negative" — the flavour of the event
//   rarity       "common" | "uncommon" | "rare" — drives base weight tier
//   weight       relative likelihood within the eligible pool (higher = more
//                common). Combined with rarity for final selection probability.
//   cooldownWeeks weeks this event is locked out after it fires (prevents the
//                same event repeating back-to-back)
//   effects      array of { target, type, value } applied to the studio:
//                  target: "money" | "fans" | "prestige"
//                  type:   "flat"    -> add value directly
//                          "percent" -> add value% of the current stat
//                value can be negative (a loss) or positive (a gain)
//   message      template describing what happened; "{effects}" is replaced at
//                runtime with a human-readable summary of the applied changes.
//
// Effects are deliberately bounded (see EVENT_CONFIG clamps in eventEngine.js)
// so events stay "noticeable but not game-breaking" per the issue guidance.

export const EVENT_DEFINITIONS = [
  // ---------------------------------------------------------------- positive
  {
    id: "viral-marketing",
    label: "Viral Marketing Success",
    category: "positive",
    rarity: "common",
    weight: 10,
    cooldownWeeks: 6,
    effects: [{ target: "fans", type: "percent", value: 8 }],
    message: "One of your campaigns went viral! {effects}",
  },
  {
    id: "award-buzz",
    label: "Award Buzz",
    category: "positive",
    rarity: "uncommon",
    weight: 7,
    cooldownWeeks: 8,
    effects: [{ target: "prestige", type: "flat", value: 25 }],
    message: "Industry insiders are buzzing about your studio's prestige. {effects}",
  },
  {
    id: "market-boom",
    label: "Market Boom",
    category: "positive",
    rarity: "uncommon",
    weight: 6,
    cooldownWeeks: 10,
    effects: [{ target: "money", type: "percent", value: 6 }],
    message: "A box-office boom lifted the whole industry. {effects}",
  },
  {
    id: "streaming-surge",
    label: "Streaming Surge",
    category: "positive",
    rarity: "common",
    weight: 8,
    cooldownWeeks: 6,
    effects: [
      { target: "money", type: "flat", value: 750000 },
      { target: "fans", type: "percent", value: 3 },
    ],
    message: "Streaming licensing deals paid off. {effects}",
  },
  {
    id: "franchise-announcement",
    label: "Major Franchise Announcement",
    category: "positive",
    rarity: "rare",
    weight: 4,
    cooldownWeeks: 14,
    effects: [
      { target: "fans", type: "percent", value: 12 },
      { target: "prestige", type: "flat", value: 15 },
    ],
    message: "Your studio announced a major franchise! {effects}",
  },
  {
    id: "government-incentive",
    label: "Government Film Incentive",
    category: "positive",
    rarity: "uncommon",
    weight: 6,
    cooldownWeeks: 12,
    effects: [{ target: "money", type: "flat", value: 1200000 }],
    message: "A government film incentive boosted your budget. {effects}",
  },
  {
    id: "intl-expansion",
    label: "International Market Expansion",
    category: "positive",
    rarity: "uncommon",
    weight: 5,
    cooldownWeeks: 12,
    effects: [
      { target: "fans", type: "percent", value: 6 },
      { target: "money", type: "percent", value: 4 },
    ],
    message: "Your films broke into new international markets. {effects}",
  },
  {
    id: "vfx-breakthrough",
    label: "Technology Breakthrough in VFX",
    category: "positive",
    rarity: "rare",
    weight: 3,
    cooldownWeeks: 16,
    effects: [{ target: "prestige", type: "flat", value: 30 }],
    message: "A VFX breakthrough at your studio wowed the industry. {effects}",
  },
  {
    id: "celebrity-casting",
    label: "Celebrity Casting Boost",
    category: "positive",
    rarity: "common",
    weight: 8,
    cooldownWeeks: 7,
    effects: [{ target: "fans", type: "percent", value: 5 }],
    message: "A high-profile casting drew major attention. {effects}",
  },

  // ---------------------------------------------------------------- negative
  {
    id: "actor-scandal",
    label: "Actor Scandal",
    category: "negative",
    rarity: "common",
    weight: 9,
    cooldownWeeks: 7,
    effects: [{ target: "fans", type: "percent", value: -7 }],
    message: "A scandal involving one of your stars hit the press. {effects}",
  },
  {
    id: "industry-strike",
    label: "Industry Strike",
    category: "negative",
    rarity: "uncommon",
    weight: 6,
    cooldownWeeks: 12,
    effects: [{ target: "money", type: "percent", value: -5 }],
    message: "An industry-wide strike disrupted production. {effects}",
  },
  {
    id: "economic-recession",
    label: "Economic Recession",
    category: "negative",
    rarity: "rare",
    weight: 4,
    cooldownWeeks: 16,
    effects: [
      { target: "money", type: "percent", value: -8 },
      { target: "fans", type: "percent", value: -3 },
    ],
    message: "An economic downturn squeezed the entertainment sector. {effects}",
  },
  {
    id: "production-accident",
    label: "Production Accident",
    category: "negative",
    rarity: "uncommon",
    weight: 5,
    cooldownWeeks: 10,
    effects: [{ target: "money", type: "flat", value: -600000 }],
    message: "An on-set accident led to costly delays. {effects}",
  },
  {
    id: "social-media-backlash",
    label: "Social Media Backlash",
    category: "negative",
    rarity: "common",
    weight: 8,
    cooldownWeeks: 6,
    effects: [{ target: "fans", type: "percent", value: -5 }],
    message: "A social media backlash hurt your studio's image. {effects}",
  },
  {
    id: "talent-retirement",
    label: "Talent Retirement",
    category: "negative",
    rarity: "uncommon",
    weight: 5,
    cooldownWeeks: 12,
    effects: [{ target: "prestige", type: "flat", value: -15 }],
    message: "A celebrated talent associated with your studio retired. {effects}",
  },
];

// -----------------------------------------------------------------------
// Production-specific events — applied to individual movies in production.
// These are separate from the global random events above.
// -----------------------------------------------------------------------
export const PRODUCTION_EVENT_DEFINITIONS = [
  // --- Negative / Crisis ---
  {
    id: "actor-injury",
    label: "Lead Actor Injury",
    category: "negative",
    chance: 0.04,
    delayWeeks: 2,
    qualityDelta: -3,
    hypeDelta: 0,
    budgetCost: 200000,
    message: "The lead actor suffered an injury on set, causing a 2-week delay.",
  },
  {
    id: "budget-overrun",
    label: "Budget Overrun",
    category: "negative",
    chance: 0.06,
    delayWeeks: 0,
    qualityDelta: 0,
    hypeDelta: -5,
    budgetCost: 500000,
    message: "Production costs spiralled out of control. Emergency funds allocated.",
  },
  {
    id: "script-rewrite",
    label: "Emergency Script Rewrite",
    category: "negative",
    chance: 0.05,
    delayWeeks: 3,
    qualityDelta: -5,
    hypeDelta: -3,
    budgetCost: 150000,
    message: "Major script issues forced an emergency rewrite, delaying production.",
  },
  {
    id: "director-conflict",
    label: "Director Creative Conflict",
    category: "negative",
    chance: 0.04,
    delayWeeks: 1,
    qualityDelta: -4,
    hypeDelta: -2,
    budgetCost: 0,
    message: "Creative differences between the director and producers caused friction.",
  },
  // --- Positive / Opportunity ---
  {
    id: "viral-trailer",
    label: "Viral Trailer",
    category: "positive",
    chance: 0.05,
    delayWeeks: 0,
    qualityDelta: 0,
    hypeDelta: 15,
    budgetCost: 0,
    message: "The movie's trailer went viral, generating massive audience anticipation!",
  },
  {
    id: "award-buzz-movie",
    label: "Early Award Buzz",
    category: "positive",
    chance: 0.03,
    delayWeeks: 0,
    qualityDelta: 5,
    hypeDelta: 10,
    budgetCost: 0,
    message: "Industry insiders are already buzzing about this film for awards season.",
  },
  {
    id: "government-incentive-movie",
    label: "Film Tax Credit",
    category: "positive",
    chance: 0.04,
    delayWeeks: 0,
    qualityDelta: 0,
    hypeDelta: 0,
    budgetCost: -300000, // Negative = money gained
    message: "The production qualified for a government film tax credit, saving costs!",
  },
];

// Engine tuning knobs. Centralised so balancing requires no logic changes.
export const EVENT_CONFIG = {
  // Probability (0..1) that the engine attempts to fire an event on a tick.
  baseTriggerChance: 0.3,

  // Maximum number of distinct events that can fire in a single tick.
  maxEventsPerTick: 1,

  // Safety clamps so no single event can be game-breaking.
  // Percent effects are capped to this absolute fraction of the stat,
  // and flat effects are capped to this absolute amount.
  maxPercentMagnitude: 15, // i.e. no percent effect exceeds +/-15%
  maxFlatMagnitude: 1500000, // no flat effect exceeds +/- 1.5M

  // Rarity multipliers applied on top of each event's base weight, so rarer
  // events are meaningfully less likely even if their weight is similar.
  rarityWeightMultiplier: {
    common: 1,
    uncommon: 0.6,
    rare: 0.3,
  },
};

export default EVENT_DEFINITIONS;
