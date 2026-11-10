import { z } from "zod";

export const createStudySchema = z.object({
  name: z.string().min(2, "Study name is required"),
  description: z.string().optional(),
  criteria: z.record(z.string(), z.unknown())
});