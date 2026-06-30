import Studio from "../models/Studio.js";

// Ranking metrics the leaderboard supports, mapped to the Studio field they
// sort on. Adding a metric here is all that's needed to expose a new ranking.
const METRIC_FIELDS = {
  prestige: "prestige",
  fans: "fans",
  revenue: "stats.totalRevenue",
  blockbusters: "stats.allTimeBlockbusters",
  level: "studioLevel",
};

// Only these fields are ever returned to the client — no owner emails, money,
// or financial history leak into the public leaderboard.
const PROJECTION =
  "name prestige fans studioLevel stats.totalRevenue stats.blockbusters stats.allTimeBlockbusters stats.moviesReleased owner";

// Read the leaderboard value for a studio for the active metric. Handles the
// two nested (stats.*) metrics explicitly and the rest as top-level fields.
const readMetricValue = (studio, field) => {
  if (field === "stats.totalRevenue") return studio.stats?.totalRevenue || 0;
  if (field === "stats.allTimeBlockbusters")
    return studio.stats?.allTimeBlockbusters || 0;
  return studio[field] || 0;
};

// Shape a studio document into a public leaderboard entry.
const toEntry = (studio, rank, currentUserId) => ({
  rank,
  studioId: String(studio._id),
  name: studio.name,
  prestige: studio.prestige || 0,
  fans: studio.fans || 0,
  studioLevel: studio.studioLevel || 1,
  revenue: studio.stats?.totalRevenue || 0,
  blockbusters: studio.stats?.allTimeBlockbusters || 0,
  moviesReleased: studio.stats?.moviesReleased || 0,
  isCurrentUser: currentUserId ? String(studio.owner) === currentUserId : false,
});

// GET /api/leaderboard?metric=<metric>&page=<n>&limit=<n>
//
// Returns studios ranked by the requested metric (defaults to prestige), with
// pagination, plus the requesting player's own studio and global rank for that
// metric so they can see where they stand even when off the current page.
//
// This is a read-only aggregation: it never writes to any studio, so it cannot
// affect existing gameplay.
export const getLeaderboard = async (req, res) => {
  try {
    const metric = String(req.query.metric || "prestige").toLowerCase();
    const field = METRIC_FIELDS[metric];
    if (!field) {
      return res.status(400).json({
        success: false,
        message: `Invalid metric. Supported metrics: ${Object.keys(
          METRIC_FIELDS
        ).join(", ")}.`,
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [studios, total] = await Promise.all([
      Studio.find()
        .sort({ [field]: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .select(PROJECTION)
        .lean(),
      Studio.countDocuments(),
    ]);

    const currentUserId = String(req.user._id);
    const leaderboard = studios.map((studio, index) =>
      toEntry(studio, skip + index + 1, currentUserId)
    );

    // The requesting player's own studio + global rank for the active metric.
    let currentUser = null;
    const myStudio = await Studio.findOne({ owner: req.user._id })
      .select(PROJECTION)
      .lean();
    if (myStudio) {
      const myValue = readMetricValue(myStudio, field);
      const higherCount = await Studio.countDocuments({
        [field]: { $gt: myValue },
      });
      currentUser = toEntry(myStudio, higherCount + 1, currentUserId);
    }

    return res.status(200).json({
      success: true,
      metric,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentUser,
      leaderboard,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
