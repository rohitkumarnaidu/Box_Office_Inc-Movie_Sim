import { z } from "zod";

export const startDirectingProjectSchema = z.object({
  directorId: z.string().min(1, "Director ID is required"),
  scriptId: z.string().min(1, "Script ID is required"),
});

export const replaceDirectorSchema = z.object({
  oldDirectorId: z.string().min(1, "Old Director ID is required"),
  newDirectorId: z.string().min(1, "New Director ID is required"),
  projectId: z.string().min(1, "Project ID is required"),
});

export const startWritingProjectSchema = z.object({
  writerId: z.string().min(1, "Writer ID is required"),
  title: z.string().min(1, "Title is required").max(100),
  genres: z.array(z.string()).min(1, "At least one genre is required").max(3),
  theme: z.string().optional(),
  logline: z.string().optional(),
});

export const replaceWriterSchema = z.object({
  oldWriterId: z.string().min(1, "Old Writer ID is required"),
  newWriterId: z.string().min(1, "New Writer ID is required"),
  projectId: z.string().min(1, "Project ID is required"),
});
