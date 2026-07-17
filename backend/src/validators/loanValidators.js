import { z } from "zod";

const VALID_TIERS = ["SMALL", "MEDIUM", "LARGE"];

export const takeLoanSchema = {
  body: z.object({
    tier: z
      .string()
      .trim()
      .toUpperCase()
      .refine((val) => VALID_TIERS.includes(val), {
        message: `Loan tier must be one of: ${VALID_TIERS.join(", ")}`,
      }),
  }),
};
