import NewsItem from "../../../models/NewsItem.js";

/**
 * Generate news article for a movie release.
 */
export const generateNewsFromRelease = async (movie, studio, week) => {
  try {
    if (!movie || !studio) {
      console.warn("generateNewsFromRelease skipped: movie or studio reference is missing");
      return null;
    }

    let headline = "";
    let body = "";
    const type = "box_office";

    const formattedGross = movie.worldwideGross ? movie.worldwideGross.toLocaleString() : "0";
    const formattedBudget = movie.budget ? movie.budget.toLocaleString() : "0";

    if (movie.verdict === "ALL_TIME_BLOCKBUSTER" || movie.verdict === "BLOCKBUSTER") {
      headline = `HISTORIC RUN: "${movie.title}" Shatters Expectations!`;
      body = `"${movie.title}", the latest blockbuster from ${studio.name}, has taken the industry by storm, grossing a massive ₹${formattedGross} worldwide. Analysts are calling it one of the most successful releases this season!`;
    } else if (movie.verdict === "HIT") {
      headline = `SUCCESS: "${movie.title}" Reels in Big Audiences`;
      body = `With strong reviews and solid word of mouth, ${studio.name}'s "${movie.title}" secures a certified HIT verdict. The movie has grossed ₹${formattedGross} worldwide against a production budget of ₹${formattedBudget}.`;
    } else if (movie.verdict === "AVERAGE") {
      headline = `STEADY: "${movie.title}" Finds Moderate Success`;
      body = `"${movie.title}" from ${studio.name} completes its theatrical run with an AVERAGE verdict. The movie grossed ₹${formattedGross} worldwide, managing to break even and satisfy its core audience.`;
    } else if (movie.verdict === "FLOP") {
      headline = `DISAPPOINTMENT: "${movie.title}" Underperforms at Box Office`;
      body = `Despite high marketing efforts, "${movie.title}" from ${studio.name} finished its run as a FLOP. The movie failed to recapture its production costs, grossing only ₹${formattedGross}.`;
    } else {
      // DISASTER
      headline = `BOX OFFICE DISASTER: "${movie.title}" Flops Spectacularly`;
      body = `Industry analysts are shocked as ${studio.name}'s high-profile project "${movie.title}" collapses, grossing a mere ₹${formattedGross} worldwide. The film goes down as a complete disaster.`;
    }

    return await NewsItem.create({
      type,
      headline,
      body,
      week,
      studioId: studio._id,
      movieId: movie._id,
    });
  } catch (error) {
    console.error("Error generating news from release:", error);
    return null;
  }
};

/**
 * Generate news article for a new trend.
 */
export const generateNewsFromTrend = async (trend, week) => {
  const headline = `TREND ALERT: ${trend.genre} Films Surge in Popularity!`;
  const body = `Audiences cannot get enough of ${trend.genre} movies. Analysts predict upcoming ${trend.genre} releases will experience a significant box office boost due to active market interest.`;

  return await NewsItem.create({
    type: "trend",
    headline,
    body,
    week,
  });
};

/**
 * Generate news article for a fired event.
 */
export const generateNewsFromEvent = async (eventLabel, eventMessage, week) => {
  const headline = `INDUSTRY SCOOP: ${eventLabel}`;
  const body = eventMessage || "Details of the event are sending ripples through the industry.";

  return await NewsItem.create({
    type: "event",
    headline,
    body,
    week,
  });
};

/**
 * Generate news article for a rival release.
 */
export const generateNewsFromRivalRelease = async (rivalRelease, week) => {
  const formattedGross = rivalRelease.boxOffice ? rivalRelease.boxOffice.toLocaleString() : "0";
  const headline = `COMPETITION: Rival Studio Releases "${rivalRelease.title}"`;
  const body = `Competitor studio "${rivalRelease.studioName}" has released its new project "${rivalRelease.title}" in the ${rivalRelease.genre} genre. The movie achieved a ${rivalRelease.verdict} verdict and grossed ₹${formattedGross} worldwide.`;

  return await NewsItem.create({
    type: "rivalry",
    headline,
    body,
    week,
  });
};
