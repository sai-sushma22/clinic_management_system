import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  physicianId: z.string().uuid(),
  date: z.string().datetime(),
  reason: z.string().optional()
});