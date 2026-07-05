/**
 * @fileoverview Film Festival Engine (issue #190)
 *
 * Simulates the major film festival circuit. Each festival evaluates submitted
 * movies and either selects them (awarding buzz and potentially a distribution
 * deal) or rejects them.
 *
 * ## Festivals
 * | Festival   | Week | Submission fee |
 * |------------|------|----------------|
 * | Sundance   |   4  | $50,000        |
 * | Cannes     |  20  | $75,000        |
 * | TIFF       |  36  | $60,000        |
 * | Venice     |  34  | $55,000        |
 * | Oscars     |  52  | $40,000        |
 *
 * ## Selection odds
 * - quality >= 80 → 70% selection chance
 * - quality >= 65 → 45% selection chance
 * - quality >= 50 → 25% selection chance
 * - quality <  50 → 10% selection chance
 *
 * ## Distribution deal (on selection)
 * - 50% chance a distribution deal is offered alongside selection.
 * - Advance: $1M – $5M (random).
 * - Revenue share: 10% – 25% of theatrical box office.
 */

import Movie from "../../../models/Movie.js";

export const FESTIVALS = [
  { id: "SUNDANCE", name: "Sundance Film Festival", week: 4,  fee: 50_000 },
  { id: "CANNES",   name: "Cannes Film Festival",   week: 20, fee: 75_000 },
  { id: "VENICE",   name: "Venice Film Festival",   week: 34, fee: 55_000 },
  { id: "TIFF",     name: "TIFF",                   week: 36, fee: 60_000 },
  { id: "OSCARS",   name: "Academy Awards Season",  week: 52, fee: 40_000 },
];

const AWARDS_BY_FESTIVAL = {
  SUNDANCE: ["Grand Jury Prize", "Audience Award", "Special Jury Award"],
  CANNES:   ["Palme d'Or", "Grand Prix", "Jury Prize"],
  VENICE:   ["Golden Lion", "Silver Lion"],
  TIFF:     ["People's Choice Award"],
  OSCARS:   ["Best Picture Nomination", "Best Director Nomination"],
};

const getSelectionChance = (quality) => {
  if (quality >= 80) return 0.70;
  if (quality >= 65) return 0.45;
  if (quality >= 50) return 0.25;
  return 0.10;
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Processes all pending festival submissions for a given week.
 * Called from tickEngine each week.
 *
 * @param {number} currentWeek
 * @param {object} studio    - Studio document (mutated for balance if deal accepted)
 * @returns {Promise<void>}
 */
export const processFestivalResults = async (currentWeek, studio) => {
  // Find the festival(s) running this week
  const festivalsThisWeek = FESTIVALS.filter(f => f.week === currentWeek);
  if (festivalsThisWeek.length === 0) return;

  for (const festival of festivalsThisWeek) {
    // Find all movies submitted to this festival that are still PENDING
    const submitted = await Movie.find({
      studioId: studio._id,
      "festivalSubmissions.festivalId": festival.id,
      "festivalSubmissions.result": "PENDING",
    });

    for (const movie of submitted) {
      const sub = movie.festivalSubmissions.find(
        (s) => s.festivalId === festival.id && s.result === "PENDING"
      );
      if (!sub) continue;

      const selectionChance = getSelectionChance(movie.quality || 0);
      const selected = Math.random() < selectionChance;

      if (selected) {
        const awards = AWARDS_BY_FESTIVAL[festival.id] || [];
        sub.result     = "SELECTED";
        sub.award      = pickRandom(awards);
        sub.buzzBonus  = Math.round(Math.random() * 15 + 5); // +5 to +20 hype

        // Boost hype
        movie.hype = Math.min(100, (movie.hype || 0) + sub.buzzBonus);

        // Distribution deal (50% chance on selection)
        if (!movie.distributionDeal?.offered && Math.random() < 0.5) {
          const advance      = Math.round((1_000_000 + Math.random() * 4_000_000) / 100_000) * 100_000;
          const revenueShare = Math.round((10 + Math.random() * 15) * 10) / 10; // 10.0 – 25.0%

          movie.distributionDeal = {
            offered:      true,
            advance,
            revenueShare,
            accepted:     false,
          };
        }
      } else {
        sub.result = "REJECTED";
      }

      await movie.save();
    }
  }
};
