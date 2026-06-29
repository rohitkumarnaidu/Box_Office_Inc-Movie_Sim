import { calculatePlayerWrittenScriptSellPrice } from "../../script/scriptResalePricing.js";
import { createScriptFromWriter } from "../../writer/scriptCreationEngine.js";
import { applyWriterAwards } from "../../writer/writerAwardsEngine.js";
import { applyWriterSalaryProgression } from "../../writer/writerSalaryProgressionEngine.js";

import { addNotification } from "../helpers/notificationHelper.js";
import { addTalentHistory } from "../helpers/historyHelper.js";

/**
 * @fileoverview Writer Engine
 *
 * Advances all active writing projects for one simulation week. When a project's
 * `completionWeek` is reached, the engine:
 *
 * 1. Generates the finished script via `createScriptFromWriter`.
 * 2. Updates the writer's stats (reputation, morale, discovery, career history).
 * 3. Evaluates and applies any awards the writer may have earned.
 * 4. Calculates a resale sell price for the new script.
 * 5. Appends the script to `gameState.ownedScripts`.
 * 6. Releases the writer back to the public market (`gameState.marketWriters`).
 * 7. Removes the completed project from `gameState.activeWritingProjects`.
 *
 * Hit/flop tracking and salary progression for writers are intentionally deferred
 * to the Movie Release pipeline to ensure consistency with the box-office result.
 *
 * **Discovery System**: A writer's `discovered` stat starts low and grows each time
 * they complete a project. Once it crosses 50, all hidden writer stats are revealed
 * to the player and a notification fires.
 */

/**
 * Processes all active writing projects for the current simulation week.
 * Mutates `gameState` in place; the caller persists the document.
 *
 * @async
 * @param {object} gameState                      - GameState document (mutated in place).
 * @param {number} gameState.currentWeek          - The week currently being processed.
 * @param {Array}  gameState.activeWritingProjects - In-progress writing projects.
 *   Each project has: `{ id, writerId, startWeek, completionWeek, genre, qualityPenalty?, progress }`.
 * @param {Array}  gameState.ownedWriters         - Writers currently under contract.
 * @param {Array}  gameState.ownedScripts         - Scripts owned by the studio; completed scripts are pushed here.
 * @param {Array}  gameState.marketWriters        - Public writer market; released writers are pushed here.
 * @param {object} studio                         - Studio document; used for script metadata and notifications.
 * @param {string} [studio.name="Unknown Studio"] - Studio name recorded in script/career history.
 * @returns {Promise<void>}
 */
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

      // Note: Writer Hit/Flop logic moved to Movie Release pipeline to ensure consistency.
      const wasHit = script.quality >= 80;
      const wasFlop = script.quality <= 55;

      writer.reputation = Math.min(100, writer.reputation + 1);

      writer.morale = Math.min(100, writer.morale + 2);

      const previousDiscovery = Number(writer.discovered || 0);

      writer.discovered = Math.min(100, previousDiscovery + 15);

      addTalentHistory(gameState, writer.id, "CAREER", {
        scriptName: script.title,
        studioName: studio?.name || "Unknown Studio",
        completionWeek: gameState.currentWeek,
        genre: project.genre,
        scriptQuality: script.quality,
      });

      const awardsWon = applyWriterAwards({
        gameState,
        writer,
        script,
        currentWeek: gameState.currentWeek,
      });

      // Salary progression and hit/flop tracking moved to Release pipeline.

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
        status: "AVAILABLE",
        assignedDirectorId: null,
        assignedDirectorName: null,
        directingProjectId: null,
      });

      addNotification(gameState, `${writer.name} completed "${script.title}".`);

      awardsWon.forEach((award) => {
        addNotification(
          gameState,
          `${writer.name} won ${award.awardName} for "${script.title}".`
        );
      });

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
