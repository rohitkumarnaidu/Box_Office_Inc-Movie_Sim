import {
  createReplacementDirector,
  retireDirector,
} from "../../director/directorRetirementService.js";

/**
 * @fileoverview Director Aging Engine
 *
 * Handles annual aging and retirement of directors in both the owned roster and
 * the public market pool. Runs once per simulated year (every 52 weeks) to keep
 * the director economy realistic.
 *
 * ## Lifecycle
 * 1. Age increments by +1 for every non-retired director.
 * 2. Directors reaching `RETIREMENT_AGE` (90) are retired:
 *    - Owned directors: any active directing projects are flagged
 *      `NEEDS_DIRECTOR_REPLACEMENT` so the player can reassign them.
 *    - Market directors: simply removed from the pool.
 * 3. For every director that retires (from either pool), one fresh replacement
 *    director is generated and added to the market — keeping total market supply stable.
 * 4. Directors who were already in "RETIRED" status are preserved in
 *    `gameState.retiredDirectors` for historical tracking.
 */

/** Retirement age threshold. Directors at or above this age are retired. */
const RETIREMENT_AGE = 90;

/** Number of simulation weeks in one in-game year; aging runs on this cadence. */
const WEEKS_PER_YEAR = 52;

/**
 * Flags all active directing projects owned by a retiring director as needing
 * a replacement, so the game doesn't leave orphaned projects.
 *
 * @param {object} gameState            - GameState document.
 * @param {Array}  [gameState.activeDirectorProjects=[]] - Active directing projects.
 * @param {object} director             - The director about to be retired.
 * @param {string} director.id          - Director's unique ID.
 * @returns {void}
 */
const markRetiredDirectorProjectsForReplacement = (gameState, director) => {
  (gameState.activeDirectorProjects || []).forEach((project) => {
    if (project.directorId !== director.id) {
      return;
    }

    project.replacementRequired = true;
    project.status = "NEEDS_DIRECTOR_REPLACEMENT";
  });
};

/**
 * Adds a director to `gameState.retiredDirectors` if not already present,
 * preserving a snapshot of their career data for auditing or future UI use.
 *
 * @param {object} gameState                   - GameState document.
 * @param {Array}  [gameState.retiredDirectors=[]] - Accumulated retired directors.
 * @param {object} director                    - Director to archive.
 * @param {string} director.id                 - Director's unique ID.
 * @returns {void}
 */
const preserveAlreadyRetiredDirector = (gameState, director) => {
  gameState.retiredDirectors = gameState.retiredDirectors || [];

  const alreadyPreserved = gameState.retiredDirectors.some(
    (retiredDirector) => retiredDirector.id === director.id
  );

  if (!alreadyPreserved) {
    const retiredDirector = director.toObject
      ? director.toObject()
      : { ...director };
    retiredDirector.status = "RETIRED";
    gameState.retiredDirectors.push(retiredDirector);
  }
};

/**
 * Ages a pool of directors by one year and retires those who have reached
 * `RETIREMENT_AGE`. Returns the directors who remain active.
 *
 * @param {object}   params
 * @param {Array}    params.directors   - The pool of director objects to process.
 * @param {object}   params.gameState   - GameState document; used for project flagging
 *                                        and the retired archive.
 * @param {"owned"|"market"} params.source - Pool origin; "owned" directors get their
 *                                        in-progress projects flagged for replacement.
 * @returns {{ activeDirectors: Array, retiredCount: number }}
 *   `activeDirectors` — directors who remain after aging.
 *   `retiredCount`    — number that retired this pass (used to spawn replacements).
 */
const ageDirectorPool = ({ directors = [], gameState, source }) => {
  const activeDirectors = [];
  let retiredCount = 0;

  directors.forEach((director) => {
    if (director.status === "RETIRED") {
      preserveAlreadyRetiredDirector(gameState, director);
      return;
    }

    director.age = Number(director.age || 0) + 1;

    if (director.age >= RETIREMENT_AGE) {
      if (source === "owned") {
        markRetiredDirectorProjectsForReplacement(gameState, director);
      }

      retireDirector({ director, gameState, source });
      retiredCount += 1;
      return;
    }

    activeDirectors.push(director);
  });

  return {
    activeDirectors,
    retiredCount,
  };
};

/**
 * Entry point called by the weekly tick engine. Ages all directors in both
 * the market and owned pools, retires eligible ones, and replenishes the
 * market with an equal number of freshly-generated replacements.
 *
 * This function is a no-op for every week that is not a year boundary
 * (`currentWeek % 52 !== 0`), keeping it cheap to call every tick.
 *
 * @param {object} gameState                   - GameState document (mutated in place).
 * @param {number} gameState.currentWeek       - Current simulation week.
 * @param {Array}  [gameState.marketDirectors=[]] - Public market director pool.
 * @param {Array}  [gameState.ownedDirectors=[]]  - Player-owned director roster.
 * @returns {void}
 */
export const processDirectorAging = (gameState) => {
  if (gameState.currentWeek % WEEKS_PER_YEAR !== 0) {
    return;
  }

  const marketResult = ageDirectorPool({
    directors: gameState.marketDirectors || [],
    gameState,
    source: "market",
  });

  const ownedResult = ageDirectorPool({
    directors: gameState.ownedDirectors || [],
    gameState,
    source: "owned",
  });

  gameState.marketDirectors = marketResult.activeDirectors;
  gameState.ownedDirectors = ownedResult.activeDirectors;

  const totalRetirements = marketResult.retiredCount + ownedResult.retiredCount;

  for (let index = 0; index < totalRetirements; index += 1) {
    gameState.marketDirectors.push(createReplacementDirector());
  }
};
