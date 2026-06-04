import { calculatePlayerWrittenScriptSellPrice } from "../../script/scriptResalePricing.js";
import { createScriptFromWriter } from "../../writer/scriptCreationEngine.js";
import { applyWriterAwards } from "../../writer/writerAwardsEngine.js";
import { applyWriterSalaryProgression } from "../../writer/writerSalaryProgressionEngine.js";

import { addNotification } from "../helpers/notificationHelper.js";

export const processWritingProjects = async (gameState, studio) => {
  const completedProjects = [];

  for (const project of gameState.activeWritingProjects) {
    const totalDuration = project.completionWeek - project.startWeek;

    const elapsedWeeks = gameState.currentWeek - project.startWeek;

    project.progress = Math.min(
      100,
      Math.floor((elapsedWeeks / totalDuration) * 100)
    );

    if (gameState.currentWeek >= project.completionWeek) {
      const writerIndex = gameState.ownedWriters.findIndex(
        (w) => w.id === project.writerId
      );

      const writer = gameState.ownedWriters[writerIndex];

      if (!writer) {
        continue;
      }

      const script = createScriptFromWriter(
        writer,
        project.genre,
        project.qualityPenalty || 0
      );

      writer.status = "AVAILABLE";

      writer.busyUntilWeek = null;

      writer.writtenScripts += 1;

      const wasHit = script.quality >= 80;
      const wasFlop = script.quality <= 55;

      if (wasHit) {
        writer.hitScripts = Number(writer.hitScripts || 0) + 1;
      } else if (wasFlop) {
        writer.flopScripts = Number(writer.flopScripts || 0) + 1;
      }

      writer.reputation = Math.min(100, writer.reputation + 1);

      writer.morale = Math.min(100, writer.morale + 2);

      const previousDiscovery = Number(writer.discovered || 0);

      writer.discovered = Math.min(100, previousDiscovery + 15);

      writer.careerHistory = writer.careerHistory || [];

      writer.careerHistory.push({
        scriptName: script.title,
        studioName: studio?.name || "Unknown Studio",
        completionWeek: gameState.currentWeek,
        genre: project.genre,
        scriptQuality: script.quality,
      });

      const awardsWon = applyWriterAwards({
        writer,
        script,
        currentWeek: gameState.currentWeek,
      });

      const salaryProgression = applyWriterSalaryProgression({
        writer,
        script,
        currentWeek: gameState.currentWeek,
        wasHit,
        wasFlop,
        awardsWon: awardsWon.length,
      });

      const creationDate = new Date();

      const sellPrice = calculatePlayerWrittenScriptSellPrice({
        script,
        writerReputation: writer.reputation,
        awards: Number(writer.awards || 0),
      });

      gameState.ownedScripts.push({
        ...script,
        sellPrice,
        writer: writer.name,
        writerId: writer.id,
        studio: studio?.name || "Unknown Studio",
        studioId: studio?._id || null,
        creationDate,
        createdAt: creationDate,
      });

      addNotification(gameState, `${writer.name} completed "${script.title}".`);

      awardsWon.forEach((award) => {
        addNotification(
          gameState,
          `${writer.name} won ${award.awardName} for "${script.title}".`
        );
      });

      if (salaryProgression.changed) {
        addNotification(
          gameState,
          `${writer.name}'s salary changed from ₹${salaryProgression.previousSalary.toLocaleString()} to ₹${salaryProgression.nextSalary.toLocaleString()}.`
        );
      }

      const releasedWriter = writer.toObject ? writer.toObject() : { ...writer };

      gameState.marketWriters.push(releasedWriter);

      gameState.ownedWriters.splice(writerIndex, 1);

      addNotification(
        gameState,
        `${writer.name}'s writing contract is complete. They returned to the writer market with no fan loss or compensation penalty.`
      );

      if (previousDiscovery < 50 && writer.discovered >= 50) {
        addNotification(
          gameState,
          `${writer.name} has been fully discovered. All writer stats are now revealed.`
        );
      }

      completedProjects.push(project.id);
    }
  }

  gameState.activeWritingProjects = gameState.activeWritingProjects.filter(
    (project) => !completedProjects.includes(project.id)
  );
};
