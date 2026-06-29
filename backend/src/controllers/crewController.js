import GameState from "../models/GameState.js";
import Studio from "../models/Studio.js";
import { generateCrewTeams } from "../services/crew/crewGenerator.js";
import { getMarketplaceTalent, invalidateUserCache } from "../utils/marketplaceHelper.js";
import Notification from "../models/Notification.js";
import { calculateSigningFee } from "../services/talent/signingFeeService.js";

const findGameState = async (userId) => GameState.findOne({ user: userId });

export const getMarketCrewTeams = async (req, res) => {
  try {
    const gameState = await findGameState(req.user._id);
    if (!gameState) return res.status(404).json({ success: false, message: "Game state not found" });

    if (!gameState.marketCrewTeams || gameState.marketCrewTeams.length === 0) {
      gameState.marketCrewTeams = generateCrewTeams(50);
      await gameState.save();
    }

    const result = getMarketplaceTalent(gameState.marketCrewTeams, req.query);
    res.status(200).json({
      success: true,
      crewTeams: result.items,
      pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOwnedCrewTeams = async (req, res) => {
  try {
    const gameState = await findGameState(req.user._id);
    if (!gameState) return res.status(404).json({ success: false, message: "Game state not found" });

    res.status(200).json({ success: true, crewTeams: gameState.ownedCrewTeams || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const hireCrewTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const gameState = await findGameState(req.user._id);
    if (!gameState) return res.status(404).json({ success: false, message: "Game state not found" });

    const index = gameState.marketCrewTeams.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: "Crew team not found" });
    const crewTeam = gameState.marketCrewTeams[index];

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

    const signingFee = calculateSigningFee(crewTeam);
    if (Number(studio.money || 0) < signingFee) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds: hiring ${crewTeam.name} requires a signing fee of ${signingFee}, but the studio has ${studio.money}.`,
        signingFee,
        studioMoney: studio.money,
      });
    }

    const hiredCrew = crewTeam.toObject ? crewTeam.toObject() : { ...crewTeam };
    hiredCrew.hiredAt = new Date();
    hiredCrew.status = "AVAILABLE";

    gameState.marketCrewTeams.splice(index, 1);
    gameState.ownedCrewTeams = gameState.ownedCrewTeams || [];
    gameState.ownedCrewTeams.push(hiredCrew);

    await Notification.create({
      gameStateId: gameState._id,
      message: `${hiredCrew.name} has been hired.`,
      createdAt: new Date(),
    });

    invalidateUserCache(String(req.user._id));
    studio.money = Math.max(0, Number(studio.money || 0) - signingFee);
    await studio.save();
    await gameState.save();
    res.status(200).json({ success: true, message: "Crew team hired", crewTeam: hiredCrew, signingFee, remainingMoney: studio.money });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCrewProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const gameState = await findGameState(req.user._id);
    if (!gameState) return res.status(404).json({ success: false, message: "Game state not found" });

    const crew =
      gameState.ownedCrewTeams?.find((c) => c.id === id) ||
      gameState.marketCrewTeams?.find((c) => c.id === id);

    if (!crew) return res.status(404).json({ success: false, message: "Crew team not found" });

    return res.status(200).json({ success: true, profile: crew });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const fireCrewTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const gameState = await findGameState(req.user._id);
    const studio = await Studio.findOne({ owner: req.user._id });

    if (!gameState || !studio) return res.status(404).json({ success: false, message: "Game state or studio not found" });

    const index = gameState.ownedCrewTeams.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: "Crew team not found" });
    const crewTeam = gameState.ownedCrewTeams[index];

    if (crewTeam.status === "BUSY") {
      return res.status(400).json({ success: false, message: "Crew team is busy on a project" });
    }

    const firedCrew = crewTeam.toObject ? crewTeam.toObject() : { ...crewTeam };
    firedCrew.hiredAt = null;

    gameState.ownedCrewTeams.splice(index, 1);
    gameState.marketCrewTeams.push(firedCrew);

    await Notification.create({
      gameStateId: gameState._id,
      message: `${firedCrew.name} has been fired.`,
      createdAt: new Date(),
    });

    invalidateUserCache(String(req.user._id));
    await gameState.save();
    res.status(200).json({ success: true, message: "Crew team fired" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
