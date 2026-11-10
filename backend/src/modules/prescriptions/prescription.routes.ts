import { Router } from "express";
import * as controller from "./prescription.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createPrescriptionSchema } from "./prescription.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("PHYSICIAN"),
  validate(createPrescriptionSchema),
  controller.createPrescription
);

router.get(
  "/consultation/:consultationId",
  authenticate,
  authorize("PHYSICIAN", "NURSE", "RECEPTIONIST"),
  controller.getPrescriptionsByConsultation
);

export default router;