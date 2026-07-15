import Movie from "../../../models/Movie.js";
import Studio from "../../../models/Studio.js";

// Merchandise sales generated based on movie's hype and existing popularity.
// Only movies with a threshold of success or hype will start generating sales.
export const processMerchandiseSales = async (gameState, studio) => {
    if (!studio) return;

    const movies = await Movie.find({
        studioId: studio._id,
        status: "RELEASED"
    });

    let weeklyMerchRevenue = 0;

    for (const movie of movies) {
        // Merchandise scaling factor:
        // High hype, high gross, and good verdict = high merch.
        // If merchandiseLevel is 0, we calculate base.
        // Base weekly sales = (Total Gross / 1000) * (Hype / 100) * 0.05
        
        // Let's make it simpler.
        // A blockbuster generates long tail merchandise.
        if ((movie.boxOffice || 0) > 100000000 || movie.hype > 70) {
            // Base merchandise potential
            const potential = (movie.boxOffice || 0) * 0.001; // 0.1% of box office per week as baseline
            
            // Modifier based on hype and verdict
            let modifier = (movie.hype || 50) / 100;
            if (movie.verdict === "Blockbuster" || movie.verdict === "All-Time Blockbuster") {
                modifier *= 1.5;
            } else if (movie.verdict === "Hit") {
                modifier *= 1.2;
            } else if (movie.verdict === "Flop" || movie.verdict === "Disaster") {
                modifier *= 0.2;
            }

            // Decay over time based on weeks since release
            const weeksSinceRelease = Math.max(1, gameState.currentWeek - (movie.releaseWeek || gameState.currentWeek));
            // Decay factor: sales halve every 10 weeks
            const decay = Math.pow(0.9, weeksSinceRelease);

            let weeklyMovieMerch = Math.round(potential * modifier * decay);

            if (weeklyMovieMerch > 0) {
                movie.merchandiseRevenue = (movie.merchandiseRevenue || 0) + weeklyMovieMerch;
                weeklyMerchRevenue += weeklyMovieMerch;
                await movie.save();
            }
        }
    }

    if (weeklyMerchRevenue > 0) {
        studio.money += weeklyMerchRevenue;
        
        studio.merchandiseIncomeHistory = studio.merchandiseIncomeHistory || [];
        studio.merchandiseIncomeHistory.push({
            week: gameState.currentWeek,
            amount: weeklyMerchRevenue,
            reason: "Weekly Merchandise & Licensing Sales"
        });

        // We could also add a notification if revenue is high
        if (weeklyMerchRevenue > 1000000) {
            gameState.notifications.push({
                message: `Merchandise & Licensing generated ₹${weeklyMerchRevenue.toLocaleString()} this week!`,
                createdAt: new Date()
            });
        }
    }
};
