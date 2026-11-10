import { z } from "zod";

export const createConsultationSchema = z.object({
  patientId: z.string().uuid(),
  physicianId: z.string().uuid(),
  diagnosis: z.string().optional(),
  notes: z.string().optional()
});