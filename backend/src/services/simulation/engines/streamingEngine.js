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
    await gameState.save();
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
