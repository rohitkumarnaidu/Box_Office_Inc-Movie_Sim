/**
 * @fileoverview Chemistry Engine
 *
 * Manages the mutual chemistry system between creative talent (issue #194).
 *
 * After a movie is released:
 * - The director-actor, director-writer, and actor-writer pairs are evaluated.
 * - A successful collaboration (Hit/Blockbuster) increases chemistry between pairs.
 * - A failed collaboration (Flop/Disaster) decreases chemistry.
 *
 * Chemistry modifier applied to future movies:
 * - chemistry > 70  → +5 quality bonus
 * - chemistry > 40  → +2 quality bonus
 * - chemistry < -40 → -3 quality penalty
 * - chemistry < -70 → -6 quality penalty
 */

import Relationship from "../../../models/Relationship.js";
import { VERDICTS } from "../../../constants/verdicts.js";

/**
 * Returns a chemistry delta based on the movie verdict.
 *
 * @param {string} verdict
 * @returns {number}
 */
const getChemistryDelta = (verdict) => {
  switch (verdict) {
    case VERDICTS.ALL_TIME_BLOCKBUSTER: return 15;
    case VERDICTS.BLOCKBUSTER: return 10;
    case VERDICTS.HIT: return 5;
    case VERDICTS.AVERAGE: return 1;
    case VERDICTS.FLOP: return -5;
    case VERDICTS.DISASTER: return -12;
    default: return 0;
  }
};

/**
 * Updates or creates a chemistry relationship between two talent IDs.
 *
 * @param {string} gameStateId
 * @param {string} id1
 * @param {string} type1
 * @param {string} id2
 * @param {string} type2
 * @param {number} delta
 */
const upsertChemistry = async (gameStateId, id1, type1, id2, type2, delta) => {
  // Normalise key order so (A,B) and (B,A) map to the same document
  const [normId1, normId2] = id1 < id2 ? [id1, id2] : [id2, id1];
  const [normType1, normType2] = id1 < id2 ? [type1, type2] : [type2, type1];

  try {
    const rel = await Relationship.findOneAndUpdate(
      { gameStateId, talentId1: normId1, talentId2: normId2 },
      {
        $setOnInsert: { talentType1: normType1, talentType2: normType2 },
        $inc: { chemistry: delta, collaborations: 1 },
      },
      { upsert: true, new: true }
    );
    // Clamp to [-100, 100]
    if (rel.chemistry > 100) { rel.chemistry = 100; await rel.save(); }
    if (rel.chemistry < -100) { rel.chemistry = -100; await rel.save(); }
  } catch {
    // Ignore duplicate key errors on concurrent ticks
  }
};

/**
 * Called after a movie is released to update chemistry between all talent pairs.
 *
 * @param {string} gameStateId
 * @param {object} movie  - The released movie with verdict populated.
 * @param {string|null} directorId
 * @param {string|null} leadActorId
 * @param {string|null} writerId     - Optional; may not be present on all movies.
 */
export const updateChemistryAfterRelease = async (gameStateId, movie, directorId, leadActorId, writerId) => {
  const delta = getChemistryDelta(movie.verdict);

  const pairs = [];
  if (directorId && leadActorId) pairs.push([directorId, "DIRECTOR", leadActorId, "ACTOR"]);
  if (directorId && writerId)    pairs.push([directorId, "DIRECTOR", writerId, "WRITER"]);
  if (leadActorId && writerId)   pairs.push([leadActorId, "ACTOR", writerId, "WRITER"]);

  await Promise.all(
    pairs.map(([id1, type1, id2, type2]) =>
      upsertChemistry(gameStateId, id1, type1, id2, type2, delta)
    )
  );
};

/**
 * Returns the quality bonus/penalty for a specific director-actor pair.
 * Called during movie creation to factor chemistry into initial quality.
 *
 * @param {string} gameStateId
 * @param {string} directorId
 * @param {string} actorId
 * @returns {Promise<number>} quality modifier (-6 to +5)
 */
export const getChemistryQualityBonus = async (gameStateId, directorId, actorId) => {
  const [normId1, normId2] = directorId < actorId ? [directorId, actorId] : [actorId, directorId];

  const rel = await Relationship.findOne({
    gameStateId,
    talentId1: normId1,
    talentId2: normId2,
  }).lean();

  if (!rel) return 0;

  const c = rel.chemistry;
  if (c > 70) return 5;
  if (c > 40) return 2;
  if (c < -70) return -6;
  if (c < -40) return -3;
  return 0;
};

/**
 * Retrieves all chemistry records for a given game state.
 * Used by the GET /api/talent/chemistry endpoint.
 *
 * @param {string} gameStateId
 * @returns {Promise<Array>}
 */
export const getChemistryRecords = (gameStateId) =>
  Relationship.find({ gameStateId }).sort({ chemistry: -1 }).lean();
