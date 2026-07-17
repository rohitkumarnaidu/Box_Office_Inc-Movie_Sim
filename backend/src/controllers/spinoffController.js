import Franchise from "../models/Franchise.js";
import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";
import Notification from "../models/Notification.js";

/**
 * Create a spin-off franchise from an existing franchise.
 * POST /api/franchises/:id/spinoff
 *
 * The new franchise inherits 30% of the parent's fanbase multiplier
 * and links back to the parent via parentFranchiseId.
 */
export const createSpinoff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Spin-off franchise name is required.",
      });
    }

    const parentFranchise = await Franchise.findById(id);
    if (!parentFranchise) {
      return res.status(404).json({
        success: false,
        message: "Parent franchise not found.",
      });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found.",
      });
    }

    // Verify ownership
    if (String(parentFranchise.studioId) !== String(studio._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not own this franchise.",
      });
    }

    // Inherit 30% of parent fanbase multiplier
    const inheritedMultiplier = Math.max(1.0, parentFranchise.fanbaseMultiplier * 0.3);

    const spinoff = await Franchise.create({
      name: name.trim(),
      studioId: studio._id,
      parentFranchiseId: parentFranchise._id,
      fanbaseMultiplier: inheritedMultiplier,
      prestigeBonus: Math.floor(parentFranchise.prestigeBonus * 0.2),
    });

    const gameState = await GameState.findOne({ user: req.user._id });
    if (gameState) {
      await Notification.create({
        gameStateId: gameState._id,
        message: `Spin-off franchise "${spinoff.name}" created from "${parentFranchise.name}" with ${Math.round(inheritedMultiplier * 100)}% fanbase multiplier.`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Spin-off franchise created.",
      data: spinoff,
    });
  } catch (error) {
    console.error("Error creating spinoff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create spin-off franchise.",
    });
  }
};

/**
 * Create a crossover movie entry linking two franchises.
 * POST /api/franchises/crossover
 *
 * Requires two franchise IDs. The resulting franchise entry
 * combines both fanbases but at a higher budget cost.
 */
export const createCrossover = async (req, res) => {
  try {
    const { name, franchiseId1, franchiseId2 } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Crossover franchise name is required.",
      });
    }

    if (!franchiseId1 || !franchiseId2) {
      return res.status(400).json({
        success: false,
        message: "Two franchise IDs are required for a crossover.",
      });
    }

    if (franchiseId1 === franchiseId2) {
      return res.status(400).json({
        success: false,
        message: "Cannot crossover a franchise with itself.",
      });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found.",
      });
    }

    const franchise1 = await Franchise.findById(franchiseId1);
    const franchise2 = await Franchise.findById(franchiseId2);

    if (!franchise1 || !franchise2) {
      return res.status(404).json({
        success: false,
        message: "One or both franchises not found.",
      });
    }

    // Verify ownership of both
    if (
      String(franchise1.studioId) !== String(studio._id) ||
      String(franchise2.studioId) !== String(studio._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You must own both franchises to create a crossover.",
      });
    }

    // Combine fanbase multipliers (average * 1.5 bonus)
    const combinedMultiplier =
      ((franchise1.fanbaseMultiplier + franchise2.fanbaseMultiplier) / 2) * 1.5;

    const crossover = await Franchise.create({
      name: name.trim(),
      studioId: studio._id,
      isCrossover: true,
      crossoverFranchiseIds: [franchise1._id, franchise2._id],
      fanbaseMultiplier: Math.round(combinedMultiplier * 100) / 100,
      prestigeBonus: franchise1.prestigeBonus + franchise2.prestigeBonus,
    });

    const gameState = await GameState.findOne({ user: req.user._id });
    if (gameState) {
      await Notification.create({
        gameStateId: gameState._id,
        message: `Crossover franchise "${crossover.name}" created, combining "${franchise1.name}" and "${franchise2.name}".`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Crossover franchise created.",
      data: crossover,
    });
  } catch (error) {
    console.error("Error creating crossover:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create crossover franchise.",
    });
  }
};
