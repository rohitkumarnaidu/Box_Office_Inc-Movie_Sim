/**
 * @fileoverview Festival Controller
 *
 * Handles HTTP endpoints for the film festival circuit feature (issue #190).
 */

import Movie from "../models/Movie.js";
import Studio from "../models/Studio.js";
import GameState from "../models/GameState.js";
import { FESTIVALS } from "../services/simulation/engines/festivalEngine.js";

/**
 * POST /api/movies/:id/festivals/submit
 *
 * Submits a movie to an upcoming film festival.
 * Body: { festivalId: "SUNDANCE" | "CANNES" | "VENICE" | "TIFF" | "OSCARS" }
 */
export const submitToFestival = async (req, res) => {
  try {
    const { id } = req.params;
    const { festivalId } = req.body;

    const festival = FESTIVALS.find((f) => f.id === festivalId);
    if (!festival) {
      return res.status(400).json({
        success: false,
        message: `Unknown festival. Valid IDs: ${FESTIVALS.map((f) => f.id).join(", ")}`,
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });

    const validStatuses = ["PRODUCTION", "POST_PRODUCTION", "READY_FOR_RELEASE"];
    if (!validStatuses.includes(movie.status)) {
      return res.status(400).json({
        success: false,
        message: "Only movies in production, post-production, or ready for release can be submitted.",
      });
    }

    // Check not already submitted
    const alreadySubmitted = (movie.festivalSubmissions || []).some(
      (s) => s.festivalId === festivalId
    );
    if (alreadySubmitted) {
      return res.status(400).json({
        success: false,
        message: `This movie has already been submitted to ${festival.name}.`,
      });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

    if (studio.money < festival.fee) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. ${festival.name} submission fee is $${festival.fee.toLocaleString()}.`,
      });
    }

    const gameState = await GameState.findOne({ user: req.user._id });

    studio.money -= festival.fee;

    movie.festivalSubmissions = movie.festivalSubmissions || [];
    movie.festivalSubmissions.push({
      festivalId: festival.id,
      festivalName: festival.name,
      submittedWeek: gameState?.currentWeek || 0,
      result: "PENDING",
      award: null,
      buzzBonus: 0,
    });

    await Promise.all([movie.save(), studio.save()]);

    res.status(201).json({
      success: true,
      message: `"${movie.title}" successfully submitted to ${festival.name}. Results will be announced in Week ${festival.week}.`,
      festivalWeek: festival.week,
      submissionFee: festival.fee,
      newBalance: studio.money,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/movies/:id/festivals/deal/accept
 *
 * Accepts a distribution deal offered after festival selection.
 * The advance is credited to the studio immediately.
 */
export const acceptDistributionDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });

    if (!movie.distributionDeal?.offered) {
      return res.status(400).json({ success: false, message: "No distribution deal has been offered for this movie." });
    }
    if (movie.distributionDeal.accepted) {
      return res.status(400).json({ success: false, message: "Distribution deal already accepted." });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) return res.status(404).json({ success: false, message: "Studio not found" });

    movie.distributionDeal.accepted = true;
    studio.money += movie.distributionDeal.advance;

    await Promise.all([movie.save(), studio.save()]);

    res.status(200).json({
      success: true,
      message: `Distribution deal accepted. $${movie.distributionDeal.advance.toLocaleString()} advance credited.`,
      advance: movie.distributionDeal.advance,
      revenueShare: movie.distributionDeal.revenueShare,
      newBalance: studio.money,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
