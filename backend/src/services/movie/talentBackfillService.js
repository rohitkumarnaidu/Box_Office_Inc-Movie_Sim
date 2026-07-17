import Movie from "../../models/Movie.js";

const buildTalentMap = (gameState) => {
  const map = new Map();
  const addAll = (list) => {
    if (list && Array.isArray(list)) {
      list.forEach((t) => {
        if (t.id && t.name) map.set(t.id, t.name);
      });
    }
  };
  addAll(gameState.ownedDirectors);
  addAll(gameState.retiredDirectors);
  addAll(gameState.ownedActors);
  addAll(gameState.retiredActors);
  addAll(gameState.ownedCrewTeams);
  return map;
};

export const backfillMovieNames = async (movies, gameState) => {
  let anyUpdates = false;
  if (!movies || movies.length === 0) return false;

  const talentMap = buildTalentMap(gameState);

  for (const movie of movies) {
    const updates = {};

    if (!movie.directorName && movie.directorId) {
      updates.directorName = talentMap.get(movie.directorId) || "Unknown Director";
    }
    if (!movie.leadActorName && movie.leadActorId) {
      updates.leadActorName = talentMap.get(movie.leadActorId) || "Unknown Actor";
    }
    if (!movie.crewTeamName && movie.crewTeamId) {
      updates.crewTeamName = talentMap.get(movie.crewTeamId) || "Unknown Crew";
    }

    if (Object.keys(updates).length > 0) {
      await Movie.updateOne({ _id: movie._id }, { $set: updates });
      Object.assign(movie, updates);
      anyUpdates = true;
    }
  }

  return anyUpdates;
};
