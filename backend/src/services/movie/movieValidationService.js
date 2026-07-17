export class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ValidationError";
  }
}

export const findOwnedScript = (gameState, scriptId) => {
  const index = gameState.ownedScripts.findIndex((s) => s.id === scriptId);
  if (index === -1) return null;
  return { script: gameState.ownedScripts[index], index };
};

export const validateScript = (gameState, scriptId) => {
  const result = findOwnedScript(gameState, scriptId);
  if (!result) throw new ValidationError("Script not found", 404);
  if (result.script.status !== "AVAILABLE") {
    throw new ValidationError("Script is not available for production");
  }
  return result;
};

export const findTalent = (list, talentId) => {
  if (!list || !Array.isArray(list)) return null;
  return list.find((t) => t.id === talentId) || null;
};

export const validateTalentAvailable = (talent, name, talentType) => {
  if (!talent) {
    throw new ValidationError(`${talentType} not found`, 404);
  }
  if (talent.status !== "AVAILABLE") {
    throw new ValidationError(`${talentType} ${talent.name || name} is busy`);
  }
  return talent;
};

export const validateDirector = (gameState, directorId) => {
  const director = findTalent(gameState.ownedDirectors, directorId);
  return validateTalentAvailable(director, directorId, "Director");
};

export const validateLeadActor = (gameState, leadActorId) => {
  const actor = findTalent(gameState.ownedActors, leadActorId);
  return validateTalentAvailable(actor, leadActorId, "Lead actor");
};

export const validateSupportingActors = (gameState, supportingActorIds) => {
  const actors = [];
  if (supportingActorIds && Array.isArray(supportingActorIds)) {
    for (const actorId of supportingActorIds) {
      const actor = findTalent(gameState.ownedActors, actorId);
      if (!actor) throw new ValidationError(`Supporting actor ${actorId} not found`, 404);
      if (actor.status !== "AVAILABLE") {
        throw new ValidationError(`Supporting actor ${actor.name} is busy`);
      }
      actors.push(actor);
    }
  }
  return actors;
};

export const validateCrewTeam = (gameState, crewTeamId) => {
  const crew = findTalent(gameState.ownedCrewTeams, crewTeamId);
  return validateTalentAvailable(crew, crewTeamId, "Crew team");
};

export const validateMarketingBudget = (studio, marketingBudget, campaigns) => {
  if (campaigns && campaigns.length > 0) {
    if (studio.money < marketingBudget) {
      throw new ValidationError("Insufficient funds for marketing");
    }
  }
};

export const findScriptById = (gameState, scriptId) => {
  return (
    gameState.marketScripts?.find((s) => s.id === scriptId) ||
    gameState.ownedScripts?.find((s) => s.id === scriptId) ||
    null
  );
};
