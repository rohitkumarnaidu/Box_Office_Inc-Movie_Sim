import GameState from "../models/GameState.js";
import Studio from "../models/Studio.js";
import { generateActors } from "../services/actor/actorGenerator.js";
import { presentActors } from "../services/actor/actorPresenter.js";
import { withTransaction } from "../utils/transactionHelper.js";
import {
  calculateActorCompensation,
  calculateActorFanLoss,
} from "../services/actor/actorContractService.js";
import { getMarketplaceTalent, resolveTalent, invalidateUserCache } from "../utils/marketplaceHelper.js";
import Notification from "../models/Notification.js";
import { calculateSigningFee } from "../services/talent/signingFeeService.js";
import TalentHistory from "../models/TalentHistory.js";

const ACTOR_MARKET_SIZE = 1000;

const findGameState = async (userId) => GameState.findOne({ user: userId });

export const getMarketActors = async (req, res) => {
  try {
    const gameState = await GameState.findOne({ user: req.user._id }).select("marketActors").lean();

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    if (!gameState.marketActors || gameState.marketActors.length === 0) {
      const freshGS = await GameState.findOne({ user: req.user._id });
      freshGS.marketActors = generateActors(100);
      await freshGS.save();
      const result = getMarketplaceTalent(freshGS.marketActors, req.query);
      return res.status(200).json({
        success: true,
        actors: presentActors(result.items),
        pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
      });
    }

    const result = getMarketplaceTalent(gameState.marketActors, req.query);
    return res.status(200).json({
      success: true,
      actors: presentActors(result.items),
      pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnedActors = async (req, res) => {
  try {
    const gameState = await GameState.findOne({ user: req.user._id }).select("ownedActors").lean();

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    return res.status(200).json({
      success: true,
      actors: presentActors(gameState.ownedActors || []),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const hireActor = async (req, res) => {
  try {
    const { index } = req.params;
    const gameState = await findGameState(req.user._id);

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    const { item: marketActor, index: realIndex } = resolveTalent(gameState.marketActors || [], index);

    if (!marketActor) {
      return res.status(404).json({
        success: false,
        message: "Actor not found",
      });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    const signingFee = calculateSigningFee(marketActor);
    if (Number(studio.money || 0) < signingFee) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds: hiring this actor requires a signing fee of ${signingFee}, but the studio has ${studio.money}.`,
        signingFee,
        studioMoney: studio.money,
      });
    }

    const result = await withTransaction(async (session) => {
        const actor = marketActor.toObject ? marketActor.toObject() : { ...marketActor };

        if (actor.status === "RETIRED") {
          throw new Error("Retired actors cannot be hired");
        }

        actor.status = "AVAILABLE";
        actor.hiredAt = new Date();
        await TalentHistory.create([{
          gameStateId: gameState._id,
          talentId: actor.id,
          type: "SALARY",
          data: {
            week: Number(gameState.currentWeek || 1),
            salary: Number(actor.salary || 0),
            reason: "Hired by studio",
          }
        }], { session });

        gameState.marketActors.splice(realIndex, 1);
        gameState.ownedActors = gameState.ownedActors || [];
        gameState.ownedActors.push(actor);

        await Notification.create([{
          gameStateId: gameState._id,
          message: `${actor.name} has joined your studio.`,
          createdAt: new Date(),
        }], { session });

        studio.money = Math.max(0, Number(studio.money || 0) - signingFee);
        await studio.save({ session });

        await gameState.save({ session });
        return actor;
    });

    invalidateUserCache(String(req.user._id));
    return res.status(200).json({
      success: true,
      message: "Actor hired",
      actor: result,
      signingFee,
      remainingMoney: studio.money,
      marketActors: presentActors(gameState.marketActors || []),
      ownedActors: presentActors(gameState.ownedActors || []),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Operation rolled back due to: ${error.message}`,
    });
  }
};

export const getActorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const gameState = await findGameState(req.user._id);

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    const actor =
      gameState.ownedActors?.find((candidate) => candidate.id === id) ||
      gameState.marketActors?.find((candidate) => candidate.id === id) ||
      gameState.retiredActors?.find((candidate) => candidate.id === id);

    if (!actor) {
      return res.status(404).json({
        success: false,
        message: "Actor not found",
      });
    }

    const histories = await TalentHistory.find({
      gameStateId: gameState._id,
      talentId: actor.id,
    }).lean();

    actor.careerHistory = histories.filter((h) => h.type === "CAREER").map((h) => h.data);
    actor.salaryHistory = histories.filter((h) => h.type === "SALARY").map((h) => h.data);
    actor.awardsHistory = histories.filter((h) => h.type === "AWARD").map((h) => h.data);

    return res.status(200).json({
      success: true,
      actor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fireActor = async (req, res) => {
  try {
    const { index } = req.params;
    const gameState = await findGameState(req.user._id);
    const studio = await Studio.findOne({ owner: req.user._id });

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    const { item: ownedActor, index: realIndex } = resolveTalent(gameState.ownedActors || [], index);

    if (!ownedActor) {
      return res.status(404).json({
        success: false,
        message: "Actor not found",
      });
    }

    const activeProject = (gameState.activeActorProjects || []).find(
      (project) => project.actorId === ownedActor.id,
    );

    if (ownedActor.status === "ACTING" || ownedActor.status === "BUSY" || activeProject) {
      return res.status(400).json({
        success: false,
        message: "Actor is assigned to an active project and cannot be released.",
      });
    }

    if (ownedActor.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Only available actors can be released.",
      });
    }

    const result = await withTransaction(async (session) => {
        const actor = ownedActor.toObject ? ownedActor.toObject() : { ...ownedActor };
        const compensation = calculateActorCompensation(actor);
        const fanLoss = calculateActorFanLoss(actor);

        studio.money = Math.max(0, Number(studio.money || 0) - compensation);
        studio.fans = Math.max(0, Number(studio.fans || 0) - fanLoss);

        actor.status = "AVAILABLE";
        actor.busyUntilWeek = null;
        actor.hiredAt = null;

        gameState.ownedActors.splice(realIndex, 1);
        gameState.marketActors = gameState.marketActors || [];
        gameState.marketActors.push(actor);

        await Notification.create([{
          gameStateId: gameState._id,
          message: `${actor.name} has been released.`,
          createdAt: new Date(),
        }], { session });

        await studio.save({ session });
        await gameState.save({ session });
        
        return { actor, compensation, fanLoss };
    });

    invalidateUserCache(String(req.user._id));
    return res.status(200).json({
      success: true,
      message: "Actor released to market",
      actor: result.actor,
      compensation: result.compensation,
      fanLoss: result.fanLoss,
      remainingMoney: studio.money,
      remainingFans: studio.fans,
      marketActors: presentActors(gameState.marketActors || []),
      ownedActors: presentActors(gameState.ownedActors || []),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Operation rolled back due to: ${error.message}`,
    });
  }
};
