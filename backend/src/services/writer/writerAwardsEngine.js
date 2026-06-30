const clampStat = (value) => Math.min(100, Math.max(0, value));

const createAward = ({ awardName, script, currentWeek, genre, skillBoosts }) => ({
  awardName,
  scriptName: script.title,
  week: currentWeek,
  genre,
  skillBoosts,
  reputationGain: 5,
});

import { addTalentHistory } from "../simulation/helpers/historyHelper.js";

export const determineWriterAwards = ({ script, currentWeek }) => {
  const awards = [];
  const primaryGenre = script.genres?.[0] || "General";

  if (script.originality >= 90 && script.quality >= 80) {
    awards.push(
      createAward({
        awardName: "Best Original Screenplay",
        script,
        currentWeek,
        genre: primaryGenre,
        skillBoosts: {
          originality: 3,
          consistency: 1,
          reliability: 0,
        },
      })
    );
  }

  if (script.genres?.includes("Action") && script.quality >= 85) {
    awards.push(
      createAward({
        awardName: "Best Action Script",
        script,
        currentWeek,
        genre: "Action",
        skillBoosts: {
          originality: 1,
          consistency: 2,
          reliability: 1,
        },
      })
    );
  }

  if (script.genres?.includes("Comedy") && script.quality >= 85) {
    awards.push(
      createAward({
        awardName: "Best Comedy Script",
        script,
        currentWeek,
        genre: "Comedy",
        skillBoosts: {
          originality: 2,
          consistency: 1,
          reliability: 1,
        },
      })
    );
  }

  if (
    awards.length === 0 &&
    primaryGenre !== "General" &&
    script.quality >= 90
  ) {
    awards.push(
      createAward({
        awardName: `Best ${primaryGenre} Script`,
        script,
        currentWeek,
        genre: primaryGenre,
        skillBoosts: {
          originality: 1,
          consistency: 2,
          reliability: 1,
        },
      })
    );
  }

  return awards;
};

export const applyWriterAwards = ({ gameState, writer, script, currentWeek }) => {
  const awards = determineWriterAwards({ script, currentWeek });

  if (awards.length === 0) {
    return [];
  }

  writer.awards = Number(writer.awards || 0) + awards.length;
  writer.awardsHistory = writer.awardsHistory || [];

  awards.forEach((award) => {
    writer.originality = clampStat(
      Number(writer.originality || 0) + Number(award.skillBoosts.originality || 0)
    );
    writer.consistency = clampStat(
      Number(writer.consistency || 0) + Number(award.skillBoosts.consistency || 0)
    );
    writer.reliability = clampStat(
      Number(writer.reliability || 0) + Number(award.skillBoosts.reliability || 0)
    );
    writer.reputation = clampStat(
      Number(writer.reputation || 0) + Number(award.reputationGain || 0)
    );

    if (gameState) {
      addTalentHistory(gameState, writer.id, "AWARD", award);
    } else {
      writer.awardsHistory = writer.awardsHistory || [];
      writer.awardsHistory.push(award);
    }
  });

  return awards;
};
