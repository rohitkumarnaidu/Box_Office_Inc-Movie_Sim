import HistoricRecord from "../models/HistoricRecord.js";

/**
 * Get all-time top 50 records sorted by a metric (worldwideGross, openingWeekend, or roi).
 * GET /api/records
 */
export const getHistoricRecords = async (req, res) => {
  try {
    const { metric } = req.query;

    const allowedMetrics = ["worldwideGross", "openingWeekend", "roi"];
    const activeMetric = allowedMetrics.includes(metric) ? metric : "worldwideGross";

    const records = await HistoricRecord.find()
      .sort({ [activeMetric]: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
