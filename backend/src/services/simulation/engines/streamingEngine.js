import GameState from "../../../models/GameState.js";
import Movie from "../../../models/Movie.js";
import { addNotification } from "../helpers/notificationHelper.js";

// Initialize default streaming platforms if they don't exist
export const initializeStreamingPlatforms = async (gameState) => {
  if (!gameState.streamingPlatforms || gameState.streamingPlatforms.length === 0) {
    gameState.streamingPlatforms = [
      { id: "flixstream", name: "FlixStream", popularity: 80, contentBudget: 1000000000, subscribers: 50000000, exclusiveMovies: [] },
      { id: "primescreen", name: "PrimeScreen", popularity: 60, contentBudget: 2000000000, subscribers: 40000000, exclusiveMovies: [] },
      { id: "cinemax", name: "CineMax+", popularity: 40, contentBudget: 500000000, subscribers: 20000000, exclusiveMovies: [] }
    ];
  }
};

// Generates offers for a movie that is READY_FOR_RELEASE
export const generateStreamingOffers = async (movie, gameState) => {
  if (movie.status !== "READY_FOR_RELEASE" || movie.streamingDeal?.platformId) {
    return;
  }

  // Ensure platforms are initialized
  await initializeStreamingPlatforms(gameState);

  // Each platform evaluates the movie and makes an offer
  let bestOffer = null;
  let bestPlatform = null;

  gameState.streamingPlatforms.forEach(platform => {
    // Platform bidding logic based on hype, quality, and their budget
    // Base offer is slightly above budget to guarantee profit, scaled by hype and quality
    const baseValue = movie.budget * 1.1; // 10% guaranteed profit base
    
    // Quality factor (0.5 to 2.0)
    const qualityFactor = Math.max(0.5, movie.quality / 50);
    
    // Hype factor (1.0 to 3.0)
    const hypeFactor = 1 + (movie.hype / 100) * 2;
    
    // Platform popularity factor (bigger platforms pay more)
    const platformFactor = platform.popularity / 100;

    // Random competitive bidding factor
    const randomBid = 0.9 + Math.random() * 0.4; // 0.9 to 1.3

    const offerValue = Math.round(baseValue * qualityFactor * hypeFactor * platformFactor * randomBid);

    if (offerValue > (bestOffer || 0)) {
      bestOffer = offerValue;
      bestPlatform = platform;
    }
  });

  if (bestPlatform && bestOffer > 0) {
    movie.streamingDeal = {
      platformId: bestPlatform.id,
      dealValue: bestOffer,
      exclusiveWeeks: 52, // 1 year exclusivity
      status: "OFFERED"
    };
    await movie.save();
  }
};

// Weekly tick to grow platforms based on their exclusive content
export const processStreamingPlatformGrowth = async (gameState) => {
  if (!gameState.streamingPlatforms) return;

  // Simple growth simulation: platforms gain subscribers and popularity based on the average quality of their recent exclusives
  // To optimize, we don't deeply populate every tick, just use a simple randomized drift with slight bias towards platforms with more movies.
  gameState.streamingPlatforms.forEach(platform => {
    const movieCount = platform.exclusiveMovies.length;
    
    // Base growth
    let subscriberGrowth = Math.round(platform.subscribers * 0.001); // 0.1% base growth per week
    let popularityGrowth = 0;

    if (movieCount > 0) {
        // Boost growth if they have exclusives
        subscriberGrowth += movieCount * 50000;
        popularityGrowth += 0.1 * movieCount;
    } else {
        // Stagnation if no exclusives
        subscriberGrowth -= Math.round(platform.subscribers * 0.005);
        popularityGrowth -= 0.2;
    }

    platform.subscribers = Math.max(0, platform.subscribers + subscriberGrowth);
    platform.popularity = Math.min(100, Math.max(0, platform.popularity + popularityGrowth));
    
    // Replenish budget weekly
    platform.contentBudget += 10000000; 
  });
};

// Weekly royalty rate applied to a streaming deal's original value, paid each
// week of the exclusivity window on top of the one-time acceptance lump sum.
const WEEKLY_STREAMING_ROYALTY_RATE = 0.005; // 0.5% of deal value per week

/**
 * Accrues recurring weekly streaming revenue for a studio's ACCEPTED deals.
 *
 * When a movie's streaming deal is accepted, `acceptStreamingDeal` pays a
 * one-time lump sum and records `movie.releaseWeek`. This function adds the
 * missing recurring piece: for every accepted-deal movie still inside its
 * exclusivity window, the studio earns an ongoing royalty each week, scaled by
 * the hosting platform's current popularity (a healthier platform pays more for
 * the same title).
 *
 * Royalties begin the week AFTER acceptance (`weeksElapsed >= 1`, so the lump
 * sum and the first royalty never double up on the same week) and stop once the
 * deal's `exclusiveWeeks` window has elapsed — so revenue is bounded, not
 * perpetual. The query is scoped by `studioId`, so it only ever pays the
 * current studio for its own catalogue.
 *
 * Mutates `studio.money` in place; the caller (`runWeeklySimulation` →
 * `simulationController`) persists the studio after the tick. No movie documents
 * are written and no schema is changed — this reuses the embedded
 * `streamingDeal` subdoc exactly as it already exists.
 *
 * @async
 * @param {object} gameState - GameState document (provides currentWeek, platforms).
 * @param {object} studio    - Studio document, mutated in place.
 * @returns {Promise<number>} Total royalty paid this week (0 if none).
 */
export const processStreamingRevenue = async (gameState, studio) => {
  if (!gameState || !studio) return 0;

  const acceptedMovies = await Movie.find({
    studioId: studio._id,
    "streamingDeal.status": "ACCEPTED",
  })
    .select("title streamingDeal releaseWeek")
    .lean();

  if (!acceptedMovies || acceptedMovies.length === 0) return 0;

  const currentWeek = Number(gameState.currentWeek) || 0;
  let totalRoyalty = 0;
  let earningTitles = 0;

  for (const movie of acceptedMovies) {
    const deal = movie.streamingDeal;
    if (!deal || deal.status !== "ACCEPTED") continue;

    const dealValue = Number(deal.dealValue) || 0;
    const exclusiveWeeks = Number(deal.exclusiveWeeks) || 0;
    const releaseWeek = Number(movie.releaseWeek);
    if (!dealValue || !exclusiveWeeks || Number.isNaN(releaseWeek)) continue;

    // Only pay during the exclusivity window, starting the week after acceptance.
    const weeksElapsed = currentWeek - releaseWeek;
    if (weeksElapsed < 1 || weeksElapsed > exclusiveWeeks) continue;

    const platform = (gameState.streamingPlatforms || []).find(
      (p) => p.id === deal.platformId
    );
    const popularityFactor = platform
      ? 0.5 + (Number(platform.popularity) || 0) / 100
      : 1;

    const royalty = Math.round(dealValue * WEEKLY_STREAMING_ROYALTY_RATE * popularityFactor);
    if (royalty > 0) {
      totalRoyalty += royalty;
      earningTitles += 1;
    }
  }

  if (totalRoyalty > 0) {
    studio.money += totalRoyalty;
    addNotification(
      gameState,
      `Earned ₹${(totalRoyalty / 1000000).toFixed(2)}M in streaming royalties this week from ${earningTitles} exclusive title${earningTitles === 1 ? "" : "s"}.`
    );
  }

  return totalRoyalty;
};
