import { Router } from "express";
import * as controller from "./patient.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createPatientSchema } from "./patient.validation.js";


const router = Router();

router.post(
  "/",
  authenticate,
  authorize("RECEPTIONIST"),
  validate(createPatientSchema),
  controller.createPatient
);

router.get(
  "/",
  authenticate,
  authorize("RECEPTIONIST", "NURSE", "PHYSICIAN"),
  controller.getPatients
);

router.get(
  "/:id",
  authenticate,
  authorize("RECEPTIONIST", "NURSE", "PHYSICIAN"),
  controller.getPatientById
);

export default router;