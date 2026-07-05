/**
 * @fileoverview Release Date Clash Engine (issue #191)
 *
 * Detects when multiple movies from the same studio (or rival studios from
 * GameState) are scheduled to release on the same week, and applies a box
 * office penalty to each clashing film.
 *
 * Clash penalty logic:
 * - 2 movies releasing in same week: each takes a 20% opening-weekend reduction.
 * - 3+ movies:                       each takes a 35% opening-weekend reduction.
 *
 * This is applied as a multiplier on top of the normal generateBoxOffice result.
 * The `clashPenaltyApplied` flag prevents double-penalisation across ticks.
 */

import Movie from "../../../models/Movie.js";

/**
 * For a given week, returns a clash multiplier based on how many movies
 * share that scheduled release week across all studios.
 *
 * @param {number} targetWeek  - The release week to check.
 * @param {string} excludeId   - The current movie's _id (excluded from count).
 * @returns {Promise<number>}  Multiplier: 1.0 (no clash), 0.80, or 0.65.
 */
export const getClashMultiplier = async (targetWeek, excludeId) => {
  const clashCount = await Movie.countDocuments({
    scheduledReleaseWeek: targetWeek,
    status: "READY_FOR_RELEASE",
    _id: { $ne: excludeId },
  });

  if (clashCount >= 2) return 0.65; // 3+ movies total including this one
  if (clashCount === 1) return 0.80; // 2 movies total
  return 1.0;
};

/**
 * Checks movies whose scheduledReleaseWeek === currentWeek and automatically
 * releases them, applying a clash penalty if needed.
 *
 * Called from tickEngine every week.
 *
 * @param {number} currentWeek
 * @returns {Promise<string[]>} List of movie titles that auto-released this week.
 */
export const processScheduledReleases = async (currentWeek) => {
  const moviesReadyThisWeek = await Movie.find({
    scheduledReleaseWeek: currentWeek,
    status: "READY_FOR_RELEASE",
  });

  const released = [];

  for (const movie of moviesReadyThisWeek) {
    const clashMultiplier = await getClashMultiplier(currentWeek, movie._id);

    if (clashMultiplier < 1.0) {
      // Apply clash penalty to existing box office numbers
      movie.openingWeekend   = Math.round((movie.openingWeekend || 0) * clashMultiplier);
      movie.worldwideGross   = Math.round((movie.worldwideGross || 0) * clashMultiplier);
      movie.domesticGross    = Math.round((movie.domesticGross || 0) * clashMultiplier);
      movie.internationalGross = Math.round((movie.internationalGross || 0) * clashMultiplier);
      movie.boxOffice        = movie.worldwideGross;
      movie.clashPenaltyApplied = true;
    }

    movie.status      = "RELEASED";
    movie.releaseWeek = currentWeek;
    await movie.save();
    released.push(movie.title);
  }

  return released;
};
