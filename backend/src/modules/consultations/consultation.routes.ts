import { Router } from "express";
import * as controller from "./consultation.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createConsultationSchema } from "./consultation.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("PHYSICIAN"),
  validate(createConsultationSchema),
  controller.createConsultation
);

router.get(
  "/patient/:patientId",
  authenticate,
  authorize("PHYSICIAN", "NURSE", "RECEPTIONIST"),
  controller.getConsultationsByPatient
);

export default router;