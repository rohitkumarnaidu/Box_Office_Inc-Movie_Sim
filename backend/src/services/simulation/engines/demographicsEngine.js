/**
 * @fileoverview Audience Demographics Engine (issue #193)
 *
 * Assigns a primary target demographic to each movie based on its genre(s),
 * and applies a box office modifier when the movie's marketing campaign
 * aligns with or mismatches that demographic.
 *
 * ## Genre -> Demographic mapping
 * | Genre       | Primary demographic |
 * |-------------|---------------------|
 * | Animation   | FAMILIES            |
 * | Horror      | TEENS               |
 * | Romance     | TEENS               |
 * | Action      | ADULTS              |
 * | Thriller    | ADULTS              |
 * | Sci-Fi      | ADULTS              |
 * | Drama       | SENIORS             |
 * | Documentary | SENIORS             |
 * | default     | ADULTS              |
 *
 * ## Campaign -> Demographic alignment
 * | Campaign    | Best demographic |
 * |-------------|------------------|
 * | social      | TEENS            |
 * | influencer  | TEENS            |
 * | tv          | FAMILIES/SENIORS |
 * | newspaper   | SENIORS          |
 * | pr          | SENIORS          |
 * | trailer     | ADULTS           |
 * | digital     | ADULTS/TEENS     |
 * | billboards  | FAMILIES         |
 *
 * ## Modifiers
 * - Perfect alignment (campaign → demographic matches genre demographic): +15% box office
 * - Mismatch (campaign demographic is opposite): -10% box office
 * - Neutral: ±0%
 */

const GENRE_DEMOGRAPHICS = {
  Animation:   "FAMILIES",
  Horror:      "TEENS",
  Romance:     "TEENS",
  Action:      "ADULTS",
  Thriller:    "ADULTS",
  "Sci-Fi":    "ADULTS",
  Adventure:   "ADULTS",
  Fantasy:     "ADULTS",
  Comedy:      "FAMILIES",
  Drama:       "SENIORS",
  Documentary: "SENIORS",
};

const CAMPAIGN_DEMOGRAPHICS = {
  social:      ["TEENS"],
  influencer:  ["TEENS"],
  tv:          ["FAMILIES", "SENIORS"],
  newspaper:   ["SENIORS"],
  pr:          ["SENIORS"],
  trailer:     ["ADULTS"],
  teaser:      ["ADULTS"],
  digital:     ["ADULTS", "TEENS"],
  billboards:  ["FAMILIES"],
};

/**
 * Determines the primary audience demographic for a movie.
 *
 * @param {string[]} genres - Array of genre strings.
 * @returns {"TEENS"|"FAMILIES"|"ADULTS"|"SENIORS"}
 */
export const getMovieDemographic = (genres = []) => {
  for (const genre of genres) {
    if (GENRE_DEMOGRAPHICS[genre]) return GENRE_DEMOGRAPHICS[genre];
  }
  return "ADULTS";
};

/**
 * Computes a box office multiplier based on how well the selected marketing
 * campaigns target the movie's primary demographic.
 *
 * @param {string[]} genres            - Movie genre list.
 * @param {string[]} marketingCampaigns - Campaign IDs selected during creation.
 * @returns {number} Multiplier (0.90 – 1.15)
 */
export const getDemographicMultiplier = (genres, marketingCampaigns = []) => {
  if (!marketingCampaigns || marketingCampaigns.length === 0) return 1;

  const targetDemo = getMovieDemographic(genres);
  let matchCount = 0;
  let mismatchCount = 0;

  for (const campaignId of marketingCampaigns) {
    const campaignDemos = CAMPAIGN_DEMOGRAPHICS[campaignId];
    if (!campaignDemos) continue;

    if (campaignDemos.includes(targetDemo)) {
      matchCount++;
    } else {
      // Opposite demographics penalise (e.g. newspaper ads for a teen horror)
      mismatchCount++;
    }
  }

  if (matchCount > mismatchCount) return 1.15;   // Targeted audience well
  if (mismatchCount > matchCount) return 0.90;   // Missed the audience
  return 1.0;                                     // Neutral
};
