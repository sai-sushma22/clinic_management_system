import { z } from "zod";

export const evaluateEligibilitySchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  studyId: z.string().uuid("Invalid study ID")
});