import { z } from "zod";

const VALID_CAMPAIGN_IDS = [
  "trailer", "teaser", "pr", "tv", "newspaper", "digital", "social", "influencer", "billboards"
];

// Define a reusable regex for MongoDB ObjectIds
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Exporting the Zod object directly (Cleaner pattern)
export const createMovieSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
  scriptId: z.string().regex(objectIdRegex, "Invalid Script ID format"),
  directorId: z.string().regex(objectIdRegex, "Invalid Director ID format"),
  leadActorId: z.string().regex(objectIdRegex, "Invalid Lead Actor ID format"),
  supportingActorIds: z.array(z.string().regex(objectIdRegex, "Invalid Supporting Actor ID format")).optional(),
  crewTeamId: z.string().regex(objectIdRegex, "Invalid Crew Team ID format"),
  marketingCampaignIds: z.array(z.string()).optional().refine(
    (ids) => !ids || ids.every((id) => VALID_CAMPAIGN_IDS.includes(id)),
    { message: `Each marketing campaign ID must be one of: ${VALID_CAMPAIGN_IDS.join(", ")}` }
  ),
  franchiseId: z.string().regex(objectIdRegex, "Invalid Franchise ID format").optional(),
  createFranchise: z.boolean().optional(),
  franchiseName: z.string().trim().max(50, "Franchise name must not exceed 50 characters").optional(),
});

// Exporting the structural pieces cleanly
export const releaseMovieParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid Movie ID format"),
});
