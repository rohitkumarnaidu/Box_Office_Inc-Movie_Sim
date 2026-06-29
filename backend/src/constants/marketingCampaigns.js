export const MARKETING_CAMPAIGNS = [
  { id: "trailer", name: "Trailer Campaign", cost: 100000, hypeBoost: 8 },
  { id: "teaser", name: "Teaser Campaign", cost: 50000, hypeBoost: 4 },
  { id: "pr", name: "PR Campaign", cost: 200000, hypeBoost: 12 },
  { id: "tv", name: "TV Advertising", cost: 500000, hypeBoost: 25 },
  { id: "newspaper", name: "Newspaper Advertising", cost: 50000, hypeBoost: 3 },
  { id: "digital", name: "Digital Ads", cost: 250000, hypeBoost: 15 },
  { id: "social", name: "Social Media Campaign", cost: 150000, hypeBoost: 10 },
  { id: "influencer", name: "Influencer Campaign", cost: 300000, hypeBoost: 18 },
  { id: "billboards", name: "Billboards", cost: 200000, hypeBoost: 10 },
];

// Genre-specific marketing effectiveness.
//
// Different genres respond to different promotional channels, so the same
// campaign produces more hype when it matches a movie's genre. This maps a
// genre (must match constants/genres.js) to the campaigns it amplifies and the
// multiplier applied to that campaign's base hypeBoost.
//
// The archetypes below follow the real-world matchups from the feature spec:
//   Horror     -> viral social media          (social / influencer / digital)
//   Action     -> trailer-focused promotion    (trailer / teaser / tv)
//   Drama      -> critics & festival / press    (pr / newspaper)
//   Sci-Fi     -> fan & convention buzz online  (digital / social / influencer)
//   Animation  -> television & community        (tv / billboards / social)
// plus a few additional sensible pairings. Any genre/campaign pair not listed
// here defaults to a neutral x1 multiplier, so existing behaviour is unchanged
// for unlisted combinations (no regression).
export const CAMPAIGN_GENRE_EFFECTIVENESS = {
  Horror: { social: 1.5, influencer: 1.4, digital: 1.2 },
  Action: { trailer: 1.5, teaser: 1.3, tv: 1.3 },
  Drama: { pr: 1.5, newspaper: 1.3 },
  "Sci-Fi": { digital: 1.4, social: 1.3, influencer: 1.3 },
  Animation: { tv: 1.5, billboards: 1.3, social: 1.2 },
  Comedy: { social: 1.4, digital: 1.3 },
  Romance: { social: 1.3, pr: 1.3 },
  Thriller: { trailer: 1.4, digital: 1.3 },
  Adventure: { trailer: 1.3, tv: 1.3 },
  Fantasy: { trailer: 1.3, digital: 1.3 },
};

// Effectiveness multiplier for a campaign given a movie's genres. A movie can
// have several genres; we take the best (highest) multiplier across them, so a
// campaign that strongly matches any one of the movie's genres gets the bonus.
// Returns 1 (neutral) when no genre amplifies the campaign.
export const getCampaignEffectiveness = (campaignId, genres) => {
  if (!Array.isArray(genres) || genres.length === 0) return 1;
  let best = 1;
  for (const genre of genres) {
    const multiplier = CAMPAIGN_GENRE_EFFECTIVENESS[genre]?.[campaignId];
    if (typeof multiplier === "number" && multiplier > best) {
      best = multiplier;
    }
  }
  return best;
};

// The genre-adjusted hype a campaign contributes, rounded to a whole number so
// the value matches what the movie-creation UI previews. Falls back to the base
// hypeBoost when the genre/campaign pair is neutral.
export const getEffectiveHypeBoost = (campaign, genres) =>
  Math.round(campaign.hypeBoost * getCampaignEffectiveness(campaign.id, genres));
