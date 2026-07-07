import Movie from "../../../models/Movie.js";
import Studio from "../../../models/Studio.js";

// Awards run annually at Week 52.
export const processAnnualAwards = async (gameState, studio) => {
    // We run awards once every 52 weeks (so when week % 52 === 0).
    // The tickEngine should call this exactly on week 52, 104, etc.

    // 1. Get all movies released this year (releaseWeek between currentWeek - 51 and currentWeek)
    const startWeek = gameState.currentWeek - 51;
    const endWeek = gameState.currentWeek;

    const eligibleMovies = await Movie.find({
        status: "RELEASED",
        releaseWeek: { $gte: startWeek, $lte: endWeek }
    });

    if (eligibleMovies.length === 0) return;

    // Evaluate Best Picture (highest quality + critic score)
    eligibleMovies.sort((a, b) => (b.quality + b.criticScore) - (a.quality + a.criticScore));
    const bestPicture = eligibleMovies[0];

    // Evaluate Best Director (highest quality + box office impact)
    // For simplicity, we just use the Best Picture's director, or we could sort directors differently
    const bestDirectorMovie = eligibleMovies.reduce((prev, curr) => (curr.criticScore > prev.criticScore) ? curr : prev, eligibleMovies[0]);
    
    // Evaluate Best Actor (highest audience appeal + quality)
    const bestActorMovie = eligibleMovies.reduce((prev, curr) => (curr.audienceScore + curr.quality > prev.audienceScore + prev.quality) ? curr : prev, eligibleMovies[0]);

    const year = Math.floor(gameState.currentWeek / 52);

    const awardRecord = {
        year,
        bestPictureId: bestPicture._id.toString(),
        bestPictureTitle: bestPicture.title,
        bestDirectorId: bestDirectorMovie.directorId,
        bestDirectorName: bestDirectorMovie.directorName || "Unknown Director",
        bestActorId: bestActorMovie.leadActorId,
        bestActorName: bestActorMovie.leadActorName || "Unknown Actor",
    };

    gameState.pastAwards = gameState.pastAwards || [];
    gameState.pastAwards.push(awardRecord);

    // Notify the user if their studio won
    if (studio) {
        let won = false;
        let messages = [];

        if (bestPicture.studioId.toString() === studio._id.toString()) {
            won = true;
            messages.push(`Best Picture (${bestPicture.title})`);
            studio.stats.awardsWon = (studio.stats.awardsWon || 0) + 1;
            studio.prestige += 500;
        }

        if (won) {
            gameState.notifications.push({
                message: `🏆 Annual Awards! Your studio won: ${messages.join(", ")}! You gained massive prestige!`,
                createdAt: new Date()
            });
        } else {
            gameState.notifications.push({
                message: `🏆 Annual Awards Year ${year}: Best Picture goes to '${bestPicture.title}'.`,
                createdAt: new Date()
            });
        }
    }
};
