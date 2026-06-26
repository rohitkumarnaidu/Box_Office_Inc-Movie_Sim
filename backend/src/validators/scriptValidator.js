import { z } from "zod";

export const scriptIndexSchema = {
  params: z.object({
    index: z.string()
      .regex(/^\d+$/, "Index must be a non-negative integer")
      .transform((val) => parseInt(val, 10)),
  }),
};
