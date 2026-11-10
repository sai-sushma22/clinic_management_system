import { Router } from "express";
import * as controller from "./appointment.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createAppointmentSchema } from "./appointment.validation.js";


const router = Router();

router.post(
  "/",
  authenticate,
  authorize("RECEPTIONIST"),
  validate(createAppointmentSchema),
  controller.createAppointment
);

router.get(
  "/",
  authenticate,
  authorize("RECEPTIONIST", "NURSE", "PHYSICIAN"),
  controller.getAppointments
);

router.put(
  "/:id/status",
  authenticate,
  authorize("RECEPTIONIST", "NURSE", "PHYSICIAN"),
  controller.updateAppointmentStatus
);

export default router;