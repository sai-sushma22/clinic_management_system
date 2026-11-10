import { Router } from "express";

import patientRoutes from "../modules/patients/patient.routes.js";
import appointmentRoutes from "../modules/appointments/appointment.routes.js";
import vitalRoutes from "../modules/vitals/vital.routes.js";
import consultationRoutes from "../modules/consultations/consultation.routes.js";
import prescriptionRoutes from "../modules/prescriptions/prescription.routes.js";
import clinicalStudyRoutes from "../modules/clinical-studies/clinicalStudy.routes.js";
import eligibilityRoutes from "../modules/patient-eligibility/eligibility.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";







const router = Router();

router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/vitals", vitalRoutes);
router.use("/consultations", consultationRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/clinical-studies", clinicalStudyRoutes);
router.use("/eligibility", eligibilityRoutes);
router.use("/auth", authRoutes);

export default router;