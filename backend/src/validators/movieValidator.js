
import { z } from "zod";

export const createMovieSchema = {
  body: z.object({
    title: z.string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title must not exceed 100 characters"),
    scriptId: z.string().min(1, "Script ID is required"),
    directorId: z.string().min(1, "Director ID is required"),
    leadActorId: z.string().min(1, "Lead Actor ID is required"),
    supportingActorIds: z.array(z.string()).optional(),
    crewTeamId: z.string().min(1, "Crew Team ID is required"),
    marketingCampaignIds: z.array(z.string()).optional(),
    franchiseId: z.string().optional(),
    createFranchise: z.boolean().optional(),
    franchiseName: z.string()
      .trim()
      .max(50, "Franchise name must not exceed 50 characters")
      .optional(),
  }),
};

export const releaseMovieSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Movie ID format"),
  }),
};
