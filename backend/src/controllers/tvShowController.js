import TVShow from "../models/TVShowModel.js";
import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";

/**
 * @fileoverview TV Show controller (issue #41).
 *
 * Provides studio-scoped create / list / read endpoints for the TVShow model.
 * Follows the exact studio-ownership pattern already used by
 * `franchiseController.js` (resolve the studio via `Studio.findOne({ owner })`,
 * scope all queries by `studioId`), and adds an optional production-budget
 * mechanic so commissioning a show is a real studio investment when a budget is
 * supplied. All behaviour is additive and independent of the movie flow.
 */

/**
 * Derives an initial 0–100 quality score from a production budget.
 *
 * Logarithmic so the first rupees matter most and returns diminish: a token
 * budget (~₹1M) lands near 38, ₹10M ≈ 56, ₹50M ≈ 73, ₹100M ≈ 80, clamping to
 * 100 around ₹1B. A zero/negative budget yields a baseline 30.
 *
 * @param {number} budget - Production budget in ₹.
 * @returns {number} Quality score clamped to [0, 100].
 */
const deriveQualityFromBudget = (budget) => {
  if (!budget || budget <= 0) return 30;
  const score = 30 + Math.round(Math.log10(budget / 1000000 + 1) * 25);
  return Math.max(0, Math.min(100, score));
};

/**
 * GET /api/tv-shows
 * Lists the authenticated studio's TV shows, newest first.
 */
export const getTVShows = async (req, res) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    const tvShows = await TVShow.find({ studioId: studio._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, tvShows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/tv-shows/:id
 * Returns a single TV show, enforcing studio ownership.
 */
export const getTVShowById = async (req, res) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    const tvShow = await TVShow.findById(req.params.id).lean();
    if (!tvShow) {
      return res.status(404).json({ success: false, message: "TV show not found" });
    }

    if (tvShow.studioId.toString() !== studio._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this TV show" });
    }

    res.status(200).json({ success: true, tvShow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/tv-shows
 * Commissions a new TV show for the authenticated studio.
 *
 * Body: { title (required), genre?, seasons?, episodesPerSeason?, budget?, platformId? }
 *
 * If a positive `budget` is supplied, the studio must have sufficient funds and
 * the amount is deducted. If `platformId` is supplied it must reference a real
 * streaming platform in the player's game state.
 */
export const createTVShow = async (req, res) => {
  try {
    const { title, genre, seasons, episodesPerSeason, budget, platformId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "TV show title is required" });
    }

    const numericBudget = Number(budget) || 0;
    if (numericBudget < 0) {
      return res.status(400).json({ success: false, message: "Budget cannot be negative" });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    if (studio.money < numericBudget) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Production requires ₹${(numericBudget / 1000000).toFixed(1)}M but the studio only has ₹${(studio.money / 1000000).toFixed(1)}M.`,
      });
    }

    // Single game-state fetch, reused for platform validation and the week stamp.
    const gameState = await GameState.findOne({ user: req.user._id });

    let resolvedPlatformId = null;
    if (platformId) {
      const platform = gameState?.streamingPlatforms?.find((p) => p.id === platformId);
      if (!platform) {
        return res.status(400).json({ success: false, message: "Streaming platform not found" });
      }
      resolvedPlatformId = platform.id;
    }

    const currentWeek = gameState?.currentWeek || 0;

    // Deduct the production budget (no-op when budget is 0).
    if (numericBudget > 0) {
      studio.money -= numericBudget;
      await studio.save();
    }

    const tvShow = await TVShow.create({
      studioId: studio._id,
      title: title.trim(),
      genre: (genre && genre.trim()) || "Drama",
      seasons: Math.max(1, Number(seasons) || 1),
      episodesPerSeason: Math.max(1, Number(episodesPerSeason) || 8),
      budget: numericBudget,
      quality: deriveQualityFromBudget(numericBudget),
      popularity: 0,
      platformId: resolvedPlatformId,
      status: "IN_PRODUCTION",
      createdWeek: currentWeek,
    });

    res.status(201).json({ success: true, tvShow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
