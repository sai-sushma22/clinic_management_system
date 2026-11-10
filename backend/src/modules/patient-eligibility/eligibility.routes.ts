import { Router } from "express";
import * as controller from "./eligibility.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { evaluateEligibilitySchema } from "./eligibility.validation.js";

const router = Router();

router.post(
  "/evaluate",
  authenticate,
  authorize("PHYSICIAN"),
  validate(evaluateEligibilitySchema),
  controller.evaluateEligibility
);

router.get(
  "/patient/:patientId",
  authenticate,
  authorize("PHYSICIAN", "NURSE", "RECEPTIONIST"),
  controller.getEligibilityByPatient
);

export default router;