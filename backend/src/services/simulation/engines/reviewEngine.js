/**
 * @fileoverview Review Engine
 *
 * Generates critic and audience scores for a released movie based on the
 * qualities of the attached talent (script, director, crew, lead actor).
 *
 * Both scores are capped at 100 and mapped to a label that the frontend
 * can display directly. No side-effects or database access occur here.
 */

/**
 * Maps a numeric review score to a qualitative label.
 *
 * Thresholds:
 * - ≤ 20  → "Terrible"
 * - ≤ 40  → "Poor"
 * - ≤ 60  → "Average"
 * - ≤ 80  → "Good"
 * - > 80  → "Excellent"
 *
 * @param {number} score - Score value in [0, 100].
 * @returns {"Terrible"|"Poor"|"Average"|"Good"|"Excellent"} label
 */
const getReviewLabel = (score) => {
  if (score <= 20) return "Terrible";
  if (score <= 40) return "Poor";
  if (score <= 60) return "Average";
  if (score <= 80) return "Good";
  return "Excellent";
};

/**
 * Generates critic and audience review scores for a movie.
 *
 * ## Scoring Formulas
 *
 * **Critic Score** (weights artistic/technical merit):
 * | Factor                  | Weight |
 * |-------------------------|--------|
 * | Script Quality          |  40%   |
 * | Director Creativity     |  30%   |
 * | Crew Technical Quality  |  20%   |
 * | Lead Actor Acting Skill |  10%   |
 *
 * **Audience Score** (weights star power and entertainment):
 * | Factor                  | Weight |
 * |-------------------------|--------|
 * | Lead Actor Popularity   |  35%   |
 * | Script Audience Appeal  |  25%   |
 * | Director Reputation     |  20%   |
 * | Movie Overall Quality   |  20%   |
 *
 * All input stats default to 50 (neutral) when the associated talent or
 * property is absent, preventing crashes on partially-populated data.
 *
 * @param {object} movie      - The movie document.
 * @param {number} [movie.quality=50] - Overall movie quality (0–100).
 * @param {object} script     - The script used for this movie.
 * @param {number} [script.quality=50]         - Writing craft quality (0–100).
 * @param {number} [script.audienceAppeal=50]  - Mass-market appeal (0–100).
 * @param {object} director   - The director attached to this movie.
 * @param {number} [director.creativity=50]    - Creative vision stat (0–100).
 * @param {number} [director.reputation=50]    - Industry reputation stat (0–100).
 * @param {object} leadActor  - The lead actor attached to this movie.
 * @param {number} [leadActor.actingSkill=50]  - Technical acting ability (0–100).
 * @param {number} [leadActor.popularity=50]   - Audience recognition (0–100).
 * @param {object} crewTeam   - The crew team attached to this movie.
 * @param {number} [crewTeam.technicalQuality=50] - Technical execution quality (0–100).
 * @returns {{
 *   criticScore: number,
 *   criticLabel: string,
 *   audienceScore: number,
 *   audienceLabel: string
 * }} Review scores and labels, both capped at 100.
 */
export const generateReviews = (movie, script, director, leadActor, crewTeam) => {
  // Defensive checks to prevent crashes if data is missing
  const scriptQuality = script?.quality ?? 50;
  const scriptAudienceAppeal = script?.audienceAppeal ?? 50;
  const directorCreativity = director?.creativity ?? 50;
  const directorReputation = director?.reputation ?? 50;
  const crewTechnicalQuality = crewTeam?.technicalQuality ?? 50;
  const actorActingSkill = leadActor?.actingSkill ?? 50;
  const actorPopularity = leadActor?.popularity ?? 50;
  const movieQuality = movie?.quality ?? 50;

  // Critic Score Formula:
  // Script Quality → 40%
  // Director Creativity → 30%
  // Crew Technical Quality → 20%
  // Lead Actor Skill → 10%
  const criticScore = Math.round(
    (scriptQuality * 0.4) +
    (directorCreativity * 0.3) +
    (crewTechnicalQuality * 0.2) +
    (actorActingSkill * 0.1)
  );

  // Audience Score Formula:
  // Lead Actor Popularity → 35%
  // Script Audience Appeal → 25%
  // Director Reputation → 20%
  // Movie Quality → 20%
  const audienceScore = Math.round(
    (actorPopularity * 0.35) +
    (scriptAudienceAppeal * 0.25) +
    (directorReputation * 0.2) +
    (movieQuality * 0.2)
  );

  return {
    criticScore: Math.min(100, criticScore),
    criticLabel: getReviewLabel(criticScore),
    audienceScore: Math.min(100, audienceScore),
    audienceLabel: getReviewLabel(audienceScore)
  };
};
