import GameState from "../models/GameState.js";
import Studio from "../models/Studio.js";
import {
  calculateDirectorCompensation,
  calculateDirectorFanLoss,
  calculateDirectorReplacementPenalty,
} from "../services/director/directorContractService.js";
import { generateDirectors } from "../services/director/directorGenerator.js";
import { buildDirectorProfile } from "../services/director/directorProfileService.js";
import { presentDirectors } from "../services/director/directorPresenter.js";
import {
  createDirectingProject,
  ensureScriptsProductionDefaults,
} from "../services/director/directingProjectService.js";
import { withTransaction } from "../utils/financeTransactionHelper.js";
import { calculateSigningFee } from "../services/talent/signingFeeService.js";
import { getMarketplaceTalent, resolveTalent, invalidateUserCache } from "../utils/marketplaceHelper.js";
import Notification from "../models/Notification.js";
import TalentHistory from "../models/TalentHistory.js";
import MarketDirector from "../models/MarketDirector.js";

const findGameState = async (userId) => GameState.findOne({ user: userId });

const presentDirectingProjects = (projects = []) =>
  projects.map((project) => ({
    id: project.id,
    directorId: project.directorId,
    directorName: project.directorName,
    scriptId: project.scriptId,
    scriptTitle: project.scriptTitle,
    movieName: project.movieName,
    genre: project.genre,
    progress: Number(project.progress || 0),
    startWeek: project.startWeek,
    completionWeek: project.completionWeek,
    status: project.status || "DIRECTING",
    qualityPenalty: Number(project.qualityPenalty || 0),
    replacementRequired: Boolean(project.replacementRequired),
  }));


const getDirectorProgress = (project, currentWeek) => {
  const existingProgress = Number(project.progress || 0);
  const totalDuration = Math.max(
    1,
    Number(project.completionWeek || currentWeek) -
      Number(project.startWeek || currentWeek)
  );
  const elapsedWeeks = Math.max(0, currentWeek - Number(project.startWeek || currentWeek));
  const calculatedProgress = Math.min(
    100,
    Math.floor((elapsedWeeks / totalDuration) * 100)
  );

  return Math.max(existingProgress, calculatedProgress);
};

const findActiveDirectorProject = (gameState, directorId, projectId = null) => {
  const projects = gameState.activeDirectorProjects || [];

  if (projectId) {
    return projects.find(
      (project) => project.id === projectId && project.directorId === directorId
    );
  }

  return projects.find((project) => project.directorId === directorId);
};

export const getMarketDirectors = async (req, res) => {
  try {
    const count = await MarketDirector.countDocuments({ userId: req.user._id });

    if (count === 0) {
      const directors = generateDirectors(50);
      const enriched = directors.map((d) => ({ ...d, userId: req.user._id }));
      await MarketDirector.insertMany(enriched);
    }

    const marketDocs = await MarketDirector.find({ userId: req.user._id }).lean();
    const result = getMarketplaceTalent(marketDocs, req.query);
    return res.status(200).json({
      success: true,
      directors: presentDirectors(result.items),
      pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnedDirectors = async (req, res) => {
  try {
    const gameState = await GameState.findOne({ user: req.user._id }).select("ownedDirectors").lean();

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    res.status(200).json({
      success: true,
      directors: presentDirectors(gameState.ownedDirectors || []),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getDirectingProjects = async (req, res) => {
  try {
    const gameState = await findGameState(req.user._id);

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    return res.status(200).json({
      success: true,
      projects: presentDirectingProjects(gameState.activeDirectorProjects || []),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const startDirectingProject = async (req, res) => {
  try {
    const { directorId, scriptId } = req.body;

    if (!directorId || !scriptId) {
      return res.status(400).json({
        success: false,
        message: "Director and script are required",
      });
    }

    const gameState = await findGameState(req.user._id);

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    ensureScriptsProductionDefaults(gameState.ownedScripts);

    const director = gameState.ownedDirectors?.find(
      (candidate) => candidate.id === directorId
    );

    if (!director) {
      return res.status(404).json({
        success: false,
        message: "Director not found",
      });
    }

    if (director.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Director is not available",
      });
    }

    const script = gameState.ownedScripts?.find(
      (candidate) => candidate.id === scriptId
    );

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      });
    }

    const scriptStatus = script.status || "AVAILABLE";

    if (scriptStatus !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Script is not available for directing",
      });
    }

    const project = createDirectingProject({
      director,
      script,
      currentWeek: gameState.currentWeek,
    });

    director.status = "DIRECTING";
    director.busyUntilWeek = project.completionWeek;

    script.status = "IN_DIRECTING";
    script.assignedDirectorId = director.id;
    script.assignedDirectorName = director.name;
    script.directingProjectId = project.id;

    gameState.activeDirectorProjects = gameState.activeDirectorProjects || [];
    gameState.activeDirectorProjects.push(project);

    await Notification.create({
      gameStateId: gameState._id,
      message: `${director.name} started directing ${script.title}.`,
      createdAt: new Date(),
    });

    await gameState.save();

    return res.status(201).json({
      success: true,
      message: "Directing project started",
      project: presentDirectingProjects([project])[0],
      projects: presentDirectingProjects(gameState.activeDirectorProjects),
      ownedDirectors: presentDirectors(gameState.ownedDirectors || []),
      ownedScripts: gameState.ownedScripts || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDirectorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const gameState = await findGameState(req.user._id);

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    let director = gameState.ownedDirectors?.find((candidate) => candidate.id === id);
    if (!director) {
      const marketDoc = await MarketDirector.findOne({ id, userId: req.user._id }).lean();
      if (marketDoc) director = marketDoc;
    }
    if (!director) {
      director = gameState.retiredDirectors?.find((candidate) => candidate.id === id);
    }

    if (!director) {
      return res.status(404).json({
        success: false,
        message: "Director not found",
      });
    }

    const histories = await TalentHistory.find({
      gameStateId: gameState._id,
      talentId: director.id,
    }).lean();

    director.careerHistory = histories.filter((h) => h.type === "CAREER").map((h) => h.data);
    director.salaryHistory = histories.filter((h) => h.type === "SALARY").map((h) => h.data);
    director.awardsHistory = histories.filter((h) => h.type === "AWARD").map((h) => h.data);

    res.status(200).json({
      success: true,
      director: buildDirectorProfile(director, gameState.currentWeek),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const hireDirector = async (req, res) => {
  try {
    const { index } = req.params;
    const gameState = await findGameState(req.user._id);

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    const marketDocs = await MarketDirector.find({ userId: req.user._id }).lean();
    const { item: marketDirector } = resolveTalent(marketDocs, index);

    if (!marketDirector) {
      return res.status(404).json({
        success: false,
        message: "Director not found",
      });
    }

    const director = { ...marketDirector };

    if (director.status === "RETIRED") {
      return res.status(400).json({
        success: false,
        message: "Retired directors cannot be hired",
      });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    const signingFee = calculateSigningFee(director);
    if (Number(studio.money || 0) < signingFee) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds: hiring ${director.name} requires a signing fee of ${signingFee}, but the studio has ${studio.money}.`,
        signingFee,
        studioMoney: studio.money,
      });
    }

    director.status = "AVAILABLE";
    director.hiredAt = new Date();

    await MarketDirector.deleteOne({ _id: marketDirector._id });
    gameState.ownedDirectors = gameState.ownedDirectors || [];
    gameState.ownedDirectors.push(director);

    await Notification.create({
      gameStateId: gameState._id,
      message: `${director.name} was hired as a director.`,
    });

    invalidateUserCache(String(req.user._id));

    studio.money = Math.max(0, Number(studio.money || 0) - signingFee);
    await studio.save();
    await gameState.save();

    const updatedMarket = await MarketDirector.find({ userId: req.user._id }).lean();

    res.status(200).json({
      success: true,
      message: "Director hired",
      director,
      signingFee,
      remainingMoney: studio.money,
      marketDirectors: presentDirectors(updatedMarket),
      ownedDirectors: presentDirectors(gameState.ownedDirectors),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fireDirector = async (req, res) => {
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

    const { item: ownedDirector, index: realIdx } = resolveTalent(gameState.ownedDirectors || [], index);

    if (!ownedDirector) {
      return res.status(404).json({
        success: false,
        message: "Director not found",
      });
    }

    const activeProject = findActiveDirectorProject(gameState, ownedDirector.id);

    if (ownedDirector.status !== "AVAILABLE" || activeProject) {
      return res.status(400).json({
        success: false,
        message:
          "Director is assigned to an active production. Replace the director before firing.",
      });
    }

    const result = await withTransaction(async (session) => {
        const director = ownedDirector.toObject
          ? ownedDirector.toObject()
          : { ...ownedDirector };

        const compensation = calculateDirectorCompensation(director);
        const fanLoss = calculateDirectorFanLoss(director);

        studio.money = Math.max(0, Number(studio.money || 0) - compensation);
        studio.fans = Math.max(0, Number(studio.fans || 0) - fanLoss);

        director.status = "AVAILABLE";
        director.busyUntilWeek = null;
        delete director.hiredAt;

        gameState.ownedDirectors.splice(realIdx, 1);
        await MarketDirector.create([{ ...director, userId: req.user._id }], { session });

        await Notification.create([{
          gameStateId: gameState._id,
          message: `${director.name} was released to the director market. Compensation ₹${compensation.toLocaleString("en-IN")} paid and ${fanLoss} fans lost.`,
        }], { session });

        await studio.save({ session });
        await gameState.save({ session });
        
        return { director, compensation, fanLoss };
    });

    invalidateUserCache(String(req.user._id));
    const updatedMarket = await MarketDirector.find({ userId: req.user._id }).lean();
    res.status(200).json({
      success: true,
      message: "Director released to market",
      director: result.director,
      compensation: result.compensation,
      fanLoss: result.fanLoss,
      remainingMoney: studio.money,
      remainingFans: studio.fans,
      marketDirectors: presentDirectors(updatedMarket),
      ownedDirectors: presentDirectors(gameState.ownedDirectors),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Operation rolled back due to: ${error.message}`,
    });
  }
};

export const replaceDirector = async (req, res) => {
  try {
    const { oldDirectorId, newDirectorId, projectId } = req.body;

    if (!oldDirectorId || !newDirectorId) {
      return res.status(400).json({
        success: false,
        message: "Old director and replacement director are required",
      });
    }

    if (oldDirectorId === newDirectorId) {
      return res.status(400).json({
        success: false,
        message: "Replacement director must be different from current director",
      });
    }

    const gameState = await findGameState(req.user._id);

    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: "Game state not found",
      });
    }

    const project = findActiveDirectorProject(gameState, oldDirectorId, projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Active production not found",
      });
    }

    const oldDirector = gameState.ownedDirectors.find(
      (director) => director.id === oldDirectorId
    );
    const newDirector = gameState.ownedDirectors.find(
      (director) => director.id === newDirectorId
    );

    if (!newDirector) {
      return res.status(404).json({
        success: false,
        message: "Replacement director not found",
      });
    }

    if (newDirector.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Replacement director is already busy",
      });
    }

    const progress = getDirectorProgress(project, gameState.currentWeek);
    const penalty = calculateDirectorReplacementPenalty(progress);

    project.progress = progress;
    project.directorId = newDirector.id;
    project.directorName = newDirector.name;
    project.qualityPenalty = Number(project.qualityPenalty || 0) + penalty;
    project.replacementRequired = false;

    const assignedScript = gameState.ownedScripts?.find(
      (script) => script.id === project.scriptId
    );

    if (assignedScript) {
      assignedScript.assignedDirectorId = newDirector.id;
      assignedScript.assignedDirectorName = newDirector.name;
      assignedScript.directingProjectId = project.id;
      assignedScript.status = "IN_DIRECTING";
    }

    newDirector.status = "DIRECTING";
    newDirector.busyUntilWeek = project.completionWeek;

    if (oldDirector) {
      oldDirector.status = "AVAILABLE";
      oldDirector.busyUntilWeek = null;
    }

    await Notification.create({
      gameStateId: gameState._id,
      message: `${oldDirector?.name || "A director"} was replaced by ${newDirector.name} on ${project.movieName || "an active production"}. Movie quality -${penalty}.`,
    });

    await gameState.save();

    res.status(200).json({
      success: true,
      message: "Director replaced successfully",
      progress,
      penalty,
      qualityPenalty: project.qualityPenalty,
      project,
      ownedDirectors: presentDirectors(gameState.ownedDirectors),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
