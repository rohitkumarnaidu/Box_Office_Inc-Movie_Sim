import { z } from "zod";

export const createTVShowSchema = {
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title must not exceed 200 characters"),
    genre: z.string().trim().max(50, "Genre must not exceed 50 characters").optional(),
    seasons: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .pipe(z.number().int().min(1, "Minimum 1 season").max(100, "Maximum 100 seasons"))
      .optional(),
    episodesPerSeason: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .pipe(z.number().int().min(1, "Minimum 1 episode per season").max(100, "Maximum 100 episodes per season"))
      .optional(),
    budget: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .pipe(z.number().min(0, "Budget cannot be negative").max(10000000000, "Budget exceeds maximum allowed"))
      .optional(),
    platformId: z.string().optional(),
  }),
};

export const getTVShowByIdSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid TV Show ID format"),
  }),
};
