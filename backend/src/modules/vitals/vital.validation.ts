import { z } from "zod";

export const createVitalSchema = z.object({
  patientId: z.string().uuid(),
  nurseId: z.string().uuid(),
  bloodPressure: z.string().optional(),
  temperature: z.number().positive().optional(),
  pulse: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  oxygenLevel: z.number().min(0).max(100).optional()
});