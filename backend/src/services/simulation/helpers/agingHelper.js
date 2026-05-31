import { generateWriter } from "../../writer/writerGenerator.js";

import { addNotification } from "./notificationHelper.js";

export const processWriterAging = (gameState) => {
  const retiredWriterIds = [];

  gameState.marketWriters.forEach((writer) => {
    writer.age += 1 / 52;

    if (writer.age >= 90) {
      retiredWriterIds.push(writer.id);

      addNotification(
        gameState,
        `${writer.name} has retired from the industry.`
      );
    }
  });

  gameState.marketWriters = gameState.marketWriters.filter(
    (writer) => !retiredWriterIds.includes(writer.id)
  );

  retiredWriterIds.forEach(() => {
    gameState.marketWriters.push(generateWriter(18));
  });
};
