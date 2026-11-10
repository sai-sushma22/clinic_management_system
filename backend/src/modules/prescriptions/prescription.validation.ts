import { z } from "zod";

export const createPrescriptionSchema = z.object({
  consultationId: z.string().uuid(),
  medicineName: z.string().min(2),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().optional()
});