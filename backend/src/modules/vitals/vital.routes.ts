import { Router } from "express";
import * as controller from "./vital.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createVitalSchema } from "./vital.validation.js";


const router = Router();

router.post(
  "/",
  authenticate,
  authorize("NURSE"),
  validate(createVitalSchema),
  controller.createVital
);

router.get(
  "/patient/:patientId",
  authenticate,
  authorize("NURSE", "PHYSICIAN", "RECEPTIONIST"),
  controller.getVitalsByPatient
);

export default router;