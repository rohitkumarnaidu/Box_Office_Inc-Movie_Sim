import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";
import Notification from "../models/Notification.js";
import { PR_CAMPAIGNS } from "../services/simulation/engines/prEngine.js";

/**
 * Launch a PR campaign to restore studio reputation.
 * POST /api/studios/pr/campaign
 */
export const launchPRCampaign = async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required.",
      });
    }

    const campaign = PR_CAMPAIGNS.find((c) => c.id === campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "PR campaign not found.",
      });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found.",
      });
    }

    if (Number(studio.money || 0) < campaign.cost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Campaign costs ₹${campaign.cost.toLocaleString()}.`,
      });
    }

    // Deduct cost and boost reputation
    studio.money = Number(studio.money || 0) - campaign.cost;
    studio.reputation = Math.min(100, Number(studio.reputation ?? 100) + campaign.reputationBoost);
    await studio.save();

    const gameState = await GameState.findOne({ user: req.user._id });
    if (gameState) {
      await Notification.create({
        gameStateId: gameState._id,
        message: `PR Campaign "${campaign.name}" launched. Reputation restored to ${studio.reputation}. Cost: ₹${campaign.cost.toLocaleString()}.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `PR campaign "${campaign.name}" launched successfully.`,
      data: {
        reputation: studio.reputation,
        money: studio.money,
        campaign,
      },
    });
  } catch (error) {
    console.error("Error launching PR campaign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to launch PR campaign.",
    });
  }
};

/**
 * Get studio reputation status and active scandals.
 * GET /api/studios/pr/status
 */
export const getPRStatus = async (req, res) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id })
      .select("reputation activeScandals name")
      .lean();

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reputation: studio.reputation ?? 100,
        activeScandals: studio.activeScandals || [],
        availableCampaigns: PR_CAMPAIGNS,
      },
    });
  } catch (error) {
    console.error("Error getting PR status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get PR status.",
    });
  }
};
