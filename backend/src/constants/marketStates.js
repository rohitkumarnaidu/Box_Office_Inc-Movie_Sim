// Market Trends — data-driven definitions for the Market Trends Engine.
//
// Each trend describes a temporary shift in audience appetite for a genre.
// A positive multiplier (> 1) means that genre's movies over-perform at the
// box office while the trend is active; a negative multiplier (< 1) means a
// genre is fatigued and under-performs.
//
// Fields:
//   id          unique key, used for de-duplication and cooldown tracking
//   label       human-readable name shown in notifications
//   genre       the genre this trend affects (must match constants/genres.js)
//   multiplier  box-office multiplier applied to matching movies
//   weight      relative likelihood of being picked when a trend spawns
//   minWeeks    minimum duration once active (inclusive)
//   maxWeeks    maximum duration once active (inclusive)
//   description flavour text for notifications / UI
//
// Genres referenced here all exist in constants/genres.js:
//   Action, Adventure, Comedy, Drama, Romance, Horror, Thriller, Mystery,
//   Sci-Fi, Fantasy, Survival, Sports, Crime, War, Historical, Biography,
//   Political, Animation, Musical.

export const TREND_DEFINITIONS = [
  // ---- Positive trends (booms) ----
  {
    id: "horror-boom",
    label: "Horror Boom",
    genre: "Horror",
    multiplier: 1.35,
    weight: 10,
    minWeeks: 3,
    maxWeeks: 6,
    description: "Audiences can't get enough scares right now.",
  },
  {
    id: "scifi-surge",
    label: "Sci-Fi Surge",
    genre: "Sci-Fi",
    multiplier: 1.3,
    weight: 9,
    minWeeks: 3,
    maxWeeks: 6,
    description: "A wave of futuristic optimism is lifting Sci-Fi.",
  },
  {
    id: "action-spectacle",
    label: "Action Spectacle Era",
    genre: "Action",
    multiplier: 1.4,
    weight: 10,
    minWeeks: 4,
    maxWeeks: 7,
    description: "Big-budget action is dominating the box office.",
  },
  {
    id: "comedy-revival",
    label: "Comedy Revival",
    genre: "Comedy",
    multiplier: 1.25,
    weight: 8,
    minWeeks: 3,
    maxWeeks: 5,
    description: "People want to laugh — comedies are thriving.",
  },
  {
    id: "drama-prestige",
    label: "Prestige Drama Wave",
    genre: "Drama",
    multiplier: 1.2,
    weight: 7,
    minWeeks: 3,
    maxWeeks: 6,
    description: "Awards buzz is drawing crowds to serious dramas.",
  },
  {
    id: "romance-renaissance",
    label: "Romance Renaissance",
    genre: "Romance",
    multiplier: 1.2,
    weight: 6,
    minWeeks: 3,
    maxWeeks: 5,
    description: "Date-night romances are back in fashion.",
  },
  {
    id: "thriller-craze",
    label: "Thriller Craze",
    genre: "Thriller",
    multiplier: 1.25,
    weight: 7,
    minWeeks: 3,
    maxWeeks: 5,
    description: "Edge-of-your-seat thrillers are selling out.",
  },
  {
    id: "animation-family-wave",
    label: "Family Animation Wave",
    genre: "Animation",
    multiplier: 1.3,
    weight: 7,
    minWeeks: 4,
    maxWeeks: 7,
    description: "Families are flocking to animated features.",
  },
  {
    id: "adventure-boom",
    label: "Adventure Boom",
    genre: "Adventure",
    multiplier: 1.28,
    weight: 7,
    minWeeks: 3,
    maxWeeks: 6,
    description: "Epic journeys are capturing the public imagination.",
  },
  {
    id: "fantasy-escapism",
    label: "Fantasy Escapism",
    genre: "Fantasy",
    multiplier: 1.3,
    weight: 7,
    minWeeks: 4,
    maxWeeks: 7,
    description: "Audiences are escaping into fantasy worlds.",
  },
  {
    id: "crime-wave",
    label: "Crime Drama Wave",
    genre: "Crime",
    multiplier: 1.2,
    weight: 6,
    minWeeks: 3,
    maxWeeks: 5,
    description: "Gritty crime stories are gripping audiences.",
  },
  {
    id: "sports-fever",
    label: "Sports Fever",
    genre: "Sports",
    multiplier: 1.22,
    weight: 5,
    minWeeks: 3,
    maxWeeks: 5,
    description: "Underdog sports stories are inspiring crowds.",
  },

  // ---- Negative trends (fatigue) ----
  {
    id: "action-fatigue",
    label: "Action Fatigue",
    genre: "Action",
    multiplier: 0.7,
    weight: 6,
    minWeeks: 3,
    maxWeeks: 5,
    description: "Audiences are tired of explosions and sequels.",
  },
  {
    id: "horror-fatigue",
    label: "Horror Fatigue",
    genre: "Horror",
    multiplier: 0.75,
    weight: 5,
    minWeeks: 3,
    maxWeeks: 5,
    description: "The horror market is oversaturated.",
  },
  {
    id: "comedy-saturation",
    label: "Comedy Saturation",
    genre: "Comedy",
    multiplier: 0.75,
    weight: 5,
    minWeeks: 3,
    maxWeeks: 5,
    description: "Too many comedies have flooded theaters.",
  },
  {
    id: "romance-slump",
    label: "Romance Slump",
    genre: "Romance",
    multiplier: 0.78,
    weight: 4,
    minWeeks: 3,
    maxWeeks: 5,
    description: "Romance films are struggling to find an audience.",
  },
  {
    id: "scifi-overload",
    label: "Sci-Fi Overload",
    genre: "Sci-Fi",
    multiplier: 0.75,
    weight: 4,
    minWeeks: 3,
    maxWeeks: 5,
    description: "Audiences are burned out on franchise Sci-Fi.",
  },
];

// Engine tuning. Centralised so behaviour is easy to balance without
// touching engine logic.
export const TREND_CONFIG = {
  // Hard cap on how many trends can be active simultaneously. Keeps the
  // market readable and prevents multiplier stacking from spiralling.
  maxActiveTrends: 3,

  // Probability (0..1) that a NEW trend spawns on any given week, evaluated
  // only while below maxActiveTrends. Tuned low so trends feel like events,
  // not constant churn.
  spawnChancePerWeek: 0.25,

  // After a trend ends, its genre is on cooldown for this many weeks before
  // another trend for the same genre can spawn. Prevents a genre from
  // boom -> fatigue -> boom flip-flopping week to week.
  genreCooldownWeeks: 3,

  // Multiplier applied to genres with no active trend (neutral baseline).
  neutralMultiplier: 1,
};

export default TREND_DEFINITIONS;
