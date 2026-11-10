import { Router } from "express";
import * as controller from "./clinicalStudy.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createStudySchema } from "./clinicalStudy.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("PHYSICIAN"),
  validate(createStudySchema),
  controller.createStudy
);

router.get(
  "/",
  authenticate,
  authorize("PHYSICIAN", "NURSE", "RECEPTIONIST"),
  controller.getStudies
);

router.get(
  "/:id",
  authenticate,
  authorize("PHYSICIAN", "NURSE", "RECEPTIONIST"),
  controller.getStudyById
);

export default router;