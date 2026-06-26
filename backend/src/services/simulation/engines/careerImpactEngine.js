/**
 * @fileoverview Career Impact Engine
 *
 * Applies post-release career effects to all talent (writer, director, lead
 * actor, crew team) attached to a movie. Called immediately after a movie is
 * released and its box-office verdict is determined.
 *
 * Effects applied per talent:
 *  - Hit/flop movie counter incremented.
 *  - Reputation / popularity adjusted by a verdict-driven delta.
 *  - Salary adjusted by a verdict-driven multiplier.
 *  - Career earnings incremented by a mock share of worldwide gross.
 *  - An entry is appended to the talent's `careerHistory` array.
 *
 * No database calls are made; the caller persists the mutated documents.
 */
import { VERDICTS } from "../../../constants/verdicts.js";
import { addTalentHistory } from "../helpers/historyHelper.js";

/**
 * Applies career-impact side-effects to all talent involved in a movie release.
 *
 * Verdict → Reputation/Popularity change:
 * | Verdict      | Delta |
 * |--------------|-------|
 * | LEGENDARY    |  +15  |
 * | BLOCKBUSTER  |  +10  |
 * | HIT          |   +5  |
 * | FLOP         |   -5  |
 * | DISASTER     |  -15  |
 * | AVERAGE      |    0  |
 *
 * Verdict → Salary multiplier:
 * | Verdict      | Multiplier |
 * |--------------|------------|
 * | LEGENDARY    |   × 1.50   |
 * | BLOCKBUSTER  |   × 1.25   |
 * | HIT          |   × 1.10   |
 * | AVERAGE      |   × 1.00   |
 * | FLOP         |   × 0.90   |
 * | DISASTER     |   × 0.75   |
 *
 * Actor popularity and writer/director/crew reputation are clamped to [0, 100].
 * Salary is mutated in place (no floor; salary can reach 0 on repeated disasters).
 * Career earnings receive a nominal share: `worldwideGross × 0.001`.
 *
 * @param {object} gameState        - GameState document; used for `currentWeek`.
 * @param {object} movie            - The released movie document.
 * @param {string} movie.verdict    - Box-office verdict string (e.g. "HIT").
 * @param {number} movie.worldwideGross - Total worldwide gross in ₹.
 * @param {string|object} movie._id - MongoDB ObjectId of the movie.
 * @param {string} movie.title      - Movie title (written into career history).
 * @param {object|null} writer      - Writer talent object (mutated in place), or null.
 * @param {object|null} director    - Director talent object (mutated in place), or null.
 * @param {object|null} leadActor   - Lead actor talent object (mutated in place), or null.
 * @param {object|null} crewTeam    - Crew team talent object (mutated in place), or null.
 * @returns {void}
 */
export const processCareerImpact = (gameState, movie, writer, director, leadActor, crewTeam) => {
  const isHit = movie.verdict === VERDICTS.HIT;
  const isBlockbuster = movie.verdict === VERDICTS.BLOCKBUSTER;
  const isAllTimeBlockbuster = movie.verdict === VERDICTS.ALL_TIME_BLOCKBUSTER;
  const isFlop = movie.verdict === VERDICTS.FLOP;
  const isDisaster = movie.verdict === VERDICTS.DISASTER;

  const isSuccess = isHit || isBlockbuster || isAllTimeBlockbuster;
  const isFailure = isFlop || isDisaster;

  /**
   * Applies verdict-driven stat changes to a single talent object.
   *
   * @param {object} talent         - The talent object to mutate.
   * @param {"actor"|"writer"|"director"|"crew"} type - Talent type; determines
   *   which stat (popularity vs. reputation) is updated.
   */
  const updateTalent = (talent, type) => {
    if (isSuccess) talent.hitMovies = (talent.hitMovies || 0) + 1;
    if (isFailure) talent.flopMovies = (talent.flopMovies || 0) + 1;

    // Reputation/Popularity change
    let repChange = 0;
    if (isAllTimeBlockbuster) repChange = 15;
    else if (isBlockbuster) repChange = 10;
    else if (isHit) repChange = 5;
    else if (isFlop) repChange = -5;
    else if (isDisaster) repChange = -15;

    if (type === 'actor') {
      talent.popularity = Math.max(0, Math.min(100, (talent.popularity || 50) + repChange));
      talent.fanbase = Math.max(0, Math.round((talent.fanbase || 0) + (repChange * movie.worldwideGross * 0.001)));
    } else {
      talent.reputation = Math.max(0, Math.min(100, (talent.reputation || 50) + repChange));
    }

    // Salary Rules
    // DISASTER: Salary decreases
    // FLOP: Small decrease
    // AVERAGE: No change
    // HIT: Increase
    // BLOCKBUSTER: Large increase
    // ALL TIME BLOCKBUSTER: Major increase
    let salaryMultiplier = 1.0;
    if (isAllTimeBlockbuster) salaryMultiplier = 1.5; // 50%
    else if (isBlockbuster) salaryMultiplier = 1.25; // 25%
    else if (isHit) salaryMultiplier = 1.1; // 10%
    else if (isFlop) salaryMultiplier = 0.9; // -10%
    else if (isDisaster) salaryMultiplier = 0.75; // -25%

    talent.salary = Math.round((talent.salary || 0) * salaryMultiplier);
    talent.careerEarnings = (talent.careerEarnings || 0) + movie.worldwideGross * 0.001; // Mock share

    // History
    addTalentHistory(gameState, talent.id, "CAREER", {
        movieId: movie._id,
        movieTitle: movie.title,
        releaseWeek: gameState.currentWeek,
        quality: movie.quality,
        boxOffice: movie.worldwideGross,
        verdict: movie.verdict
    });
  };

  if (writer) updateTalent(writer, 'writer');
  if (director) updateTalent(director, 'director');
  if (leadActor) updateTalent(leadActor, 'actor');
  if (crewTeam) updateTalent(crewTeam, 'crew');
};
