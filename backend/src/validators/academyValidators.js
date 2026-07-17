import { z } from "zod";

const VALID_TALENT_TYPES = ["actor", "director"];

const VALID_BOOTCAMP_IDS = [
  "acting_masterclass",
  "media_training",
  "directing_workshop",
  "leadership_bootcamp",
];

export const trainTalentSchema = {
  body: z.object({
    talentId: z.string().min(1, "Talent ID is required"),
    talentType: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => VALID_TALENT_TYPES.includes(val), {
        message: `Talent type must be one of: ${VALID_TALENT_TYPES.join(", ")}`,
      }),
    bootcampId: z
      .string()
      .trim()
      .refine((val) => VALID_BOOTCAMP_IDS.includes(val), {
        message: `Bootcamp ID must be one of: ${VALID_BOOTCAMP_IDS.join(", ")}`,
      }),
  }),
};
