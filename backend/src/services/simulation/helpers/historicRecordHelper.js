import HistoricRecord from "../../../models/HistoricRecord.js";

/**
 * Evaluates a released movie (player or rival) and records it if it enters
 * the top 50 all-time board for worldwide gross, opening weekend, or ROI.
 */
export const addHistoricRecord = async (movieData) => {
  try {
    const year = Math.floor((movieData.releaseWeek - 1) / 52) + 1;
    const count = await HistoricRecord.countDocuments();
    let qualifies = false;

    const currentGross = movieData.worldwideGross || movieData.boxOffice || 0;
    const currentOpening = movieData.openingWeekend || 0;
    const currentRoi = movieData.roi || 0;

    if (count < 50) {
      qualifies = true;
    } else {
      const lowestTopGross = await HistoricRecord.find().sort({ worldwideGross: -1 }).skip(49).limit(1).select("worldwideGross").lean();
      const lowestTopOpening = await HistoricRecord.find().sort({ openingWeekend: -1 }).skip(49).limit(1).select("openingWeekend").lean();
      const lowestTopRoi = await HistoricRecord.find().sort({ roi: -1 }).skip(49).limit(1).select("roi").lean();

      if (
        (lowestTopGross.length && currentGross > lowestTopGross[0].worldwideGross) ||
        (lowestTopOpening.length && currentOpening > lowestTopOpening[0].openingWeekend) ||
        (lowestTopRoi.length && currentRoi > lowestTopRoi[0].roi)
      ) {
        qualifies = true;
      }
    }

    if (qualifies) {
      await HistoricRecord.create({
        title: movieData.title,
        studioId: movieData.studioId,
        studioName: movieData.studioName,
        worldwideGross: currentGross,
        openingWeekend: currentOpening,
        roi: currentRoi,
        releaseWeek: movieData.releaseWeek,
        year,
        isRival: movieData.isRival || false
      });
    }
  } catch (error) {
    console.error("Failed to add historic record:", error);
  }
};
