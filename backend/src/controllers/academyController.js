import GameState from "../models/GameState.js";
import Studio from "../models/Studio.js";

const BOOTCAMPS = {
  acting_masterclass: { name: "Acting Masterclass", cost: 500000, stat: "actingSkill", boost: 5, target: "actor" },
  media_training: { name: "Media Training", cost: 200000, stat: "reputation", boost: 5, target: "any" },
  directing_workshop: { name: "Directing Workshop", cost: 500000, stat: "creativity", boost: 5, target: "director" },
  leadership_bootcamp: { name: "Leadership Bootcamp", cost: 300000, stat: "leadership", boost: 5, target: "director" }
};

export const trainTalent = async (req, res) => {
  try {
    const { talentId, talentType, bootcampId } = req.body;

    const bootcamp = BOOTCAMPS[bootcampId];
    if (!bootcamp) {
      return res.status(404).json({ success: false, message: "Bootcamp not found" });
    }

    if (bootcamp.target !== "any" && bootcamp.target !== talentType) {
      return res.status(400).json({ success: false, message: `This bootcamp is only for ${bootcamp.target}s` });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    if (studio.money < bootcamp.cost) {
      return res.status(400).json({ success: false, message: "Insufficient funds for this training program" });
    }

    const gameState = await GameState.findOne({ user: req.user._id });
    if (!gameState) {
      return res.status(404).json({ success: false, message: "Game state not found" });
    }

    let talent;
    if (talentType === "actor") {
      talent = gameState.ownedActors.find(a => a.id === talentId);
      if (talent) {
        // Boost actingSkill or fanbase/popularity
        if (bootcamp.stat === "actingSkill") {
          talent.actingSkill = Math.min(100, (talent.actingSkill || 0) + bootcamp.boost);
        } else if (bootcamp.stat === "reputation") {
          talent.popularity = Math.min(100, (talent.popularity || 0) + bootcamp.boost);
          talent.fanbase = Math.min(100, (talent.fanbase || 0) + bootcamp.boost * 10);
        }
      }
    } else {
      talent = gameState.ownedDirectors.find(d => d.id === talentId);
      if (talent) {
        if (bootcamp.stat === "creativity") {
          talent.creativity = Math.min(100, (talent.creativity || 0) + bootcamp.boost);
        } else if (bootcamp.stat === "leadership") {
          talent.leadership = Math.min(100, (talent.leadership || 0) + bootcamp.boost);
        } else if (bootcamp.stat === "reputation") {
          talent.reputation = Math.min(100, (talent.reputation || 0) + bootcamp.boost);
        }
      }
    }

    if (!talent) {
      return res.status(404).json({ success: false, message: "Talent not found in your contracted roster" });
    }

    // Deduct cost and save
    studio.money -= bootcamp.cost;
    gameState.markModified("ownedActors");
    gameState.markModified("ownedDirectors");

    await studio.save();
    await gameState.save();

    res.status(200).json({
      success: true,
      message: `Successfully completed ${bootcamp.name} for ${talent.name}! Stats upgraded.`,
      talent,
      studioMoney: studio.money
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
