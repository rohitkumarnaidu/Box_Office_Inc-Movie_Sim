/**
 * @fileoverview Box Office Controller
 * 
 * Controller handlers for retrieving detailed box office telemetry, regional breakdowns,
 * and theatrical performance analytics.
 */

import Movie from "../models/Movie.js";
import { generateBoxOfficeTelemetry, calculateRegionalBreakdown } from "../utils/boxOfficeAnalytics.js";

/**
 * GET /api/box-office/analytics/:movieId
 * Retrieves full box office breakdown and regional telemetry for a given movie.
 */
export const getBoxOfficeAnalytics = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const telemetry = generateBoxOfficeTelemetry(movie);
    return res.status(200).json({
      success: true,
      data: telemetry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/box-office/regional-summary
 * Retrieves aggregated regional revenue summary across all released studio movies.
 */
export const getRegionalSummary = async (req, res, next) => {
  try {
    const movies = await Movie.find({ userId: req.user._id, status: "RELEASED" });
    
    let globalNorthAmerica = 0;
    let globalEurope = 0;
    let globalAsiaPacific = 0;
    let globalLatinAmerica = 0;

    movies.forEach((m) => {
      const split = calculateRegionalBreakdown(m.worldwideGross || m.boxOffice || 0);
      globalNorthAmerica += split.northAmerica;
      globalEurope += split.europe;
      globalAsiaPacific += split.asiaPacific;
      globalLatinAmerica += split.latinAmerica;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalReleasedMovies: movies.length,
        totals: {
          northAmerica: globalNorthAmerica,
          europe: globalEurope,
          asiaPacific: globalAsiaPacific,
          latinAmerica: globalLatinAmerica,
          combinedWorldwide: globalNorthAmerica + globalEurope + globalAsiaPacific + globalLatinAmerica,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
