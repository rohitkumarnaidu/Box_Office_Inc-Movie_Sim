import { z } from "zod";

export const acceptStreamingDealSchema = {
  params: z.object({
    movieId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Movie ID format"),
  }),
};
