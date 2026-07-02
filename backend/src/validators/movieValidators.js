import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  scriptId: z.string().min(1, "Script ID is required"),
  directorId: z.string().min(1, "Director ID is required"),
  leadActorId: z.string().min(1, "Lead Actor ID is required"),
  crewTeamId: z.string().min(1, "Crew Team ID is required"),
  supportingActorIds: z.array(z.string()).optional(),
  marketingCampaignIds: z.array(z.string()).optional(),
});
