import StudioUpgrade from "../models/StudioUpgrade.js";
import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";

const UPGRADES = {
  marketing_partnership: { name: "Marketing Partnership", cost: 2000000, description: "Establishes a permanent partnership with a leading agency. Hype and promotional effectiveness boosted permanently." },
  advanced_cameras: { name: "Advanced Camera Gear", cost: 1500000, description: "Equip your director and crew with cutting-edge 8K cameras. Boosts future film quality." },
  talent_access: { name: "Talent Agency Access", cost: 3000000, description: "Unlocks priority access to rare writers, directors, and actors." }
};

export const getUpgrades = async (req, res) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    const purchased = await StudioUpgrade.find({ studioId: studio._id }).lean();
    
    res.status(200).json({
      success: true,
      purchased: purchased.map(p => p.upgradeId),
      available: Object.keys(UPGRADES).map(id => ({ id, ...UPGRADES[id] })),
      studioMoney: studio.money
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const buyUpgrade = async (req, res) => {
  try {
    const { upgradeId } = req.body;
    const upgrade = UPGRADES[upgradeId];
    if (!upgrade) {
      return res.status(404).json({ success: false, message: "Upgrade details not found" });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    if (studio.money < upgrade.cost) {
      return res.status(400).json({ success: false, message: "Insufficient funds for this studio upgrade" });
    }

    const alreadyPurchased = await StudioUpgrade.findOne({ studioId: studio._id, upgradeId });
    if (alreadyPurchased) {
      return res.status(400).json({ success: false, message: "This upgrade is already active for your studio" });
    }

    const gameState = await GameState.findOne({ user: req.user._id });
    const currentWeek = gameState?.currentWeek || 1;

    studio.money -= upgrade.cost;
    studio.prestige += 25; // Permanent prestige increase for studio development

    const purchasedUpgrade = await StudioUpgrade.create({
      studioId: studio._id,
      upgradeId,
      purchasedWeek: currentWeek
    });

    await studio.save();

    res.status(200).json({
      success: true,
      message: `Successfully purchased "${upgrade.name}"! Prestige increased by +25.`,
      purchasedUpgrade,
      studioMoney: studio.money
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
