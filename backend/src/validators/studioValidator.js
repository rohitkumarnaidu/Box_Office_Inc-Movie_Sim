import { z } from "zod";

export const studioUpdateSchema = {
  body: z.object({
    name: z.string()
      .trim() // Added .trim() to remove leading/trailing whitespace
      .min(3, "Studio name must be at least 3 characters")
      .max(50, "Studio name must not exceed 50 characters"),
  }),
};
