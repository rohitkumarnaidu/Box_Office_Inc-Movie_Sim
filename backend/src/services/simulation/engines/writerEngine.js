import { createScriptFromWriter } from "../../writer/scriptCreationEngine.js";

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

      gameState.ownedScripts.push({
        ...script,
        createdAt: new Date(),
      });

      writer.status = "AVAILABLE";

      writer.busyUntilWeek = null;

      writer.writtenScripts += 1;

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

      addNotification(gameState, `${writer.name} completed "${script.title}".`);

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
