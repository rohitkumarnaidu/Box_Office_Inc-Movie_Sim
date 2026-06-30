import { z } from "zod";

export const registerSchema = {
  body: z.object({
    username: z.string()
      .trim() // Added .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must not exceed 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
    email: z.string().email("Invalid email format"),
    password: z.string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must not exceed 128 characters"),
    studioName: z.string()
      .trim() // Added .trim() for consistency
      .min(3, "Studio name must be at least 3 characters")
      .max(50, "Studio name must not exceed 50 characters")
      .optional()
      .or(z.literal("")),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string()
      .trim() // Added .trim()
      .email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
};
