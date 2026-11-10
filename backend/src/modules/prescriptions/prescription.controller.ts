import type { Request, Response } from "express";
import * as prescriptionService from "./prescription.service.js";

export const createPrescription = async (
  req: Request,
  res: Response
) => {
  try {
    const prescription =
      await prescriptionService.createPrescription(req.body);

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({
      message: "Error creating prescription",
      error
    });
  }
};

export const getPrescriptionsByConsultation = async (
  req: Request,
  res: Response
) => {
  try {
    const consultationId = req.params.consultationId;

    if (typeof consultationId !== "string") {
      res.status(400).json({ message: "Invalid consultation ID" });
      return;
    }

    const prescriptions =
      await prescriptionService.getPrescriptionsByConsultation(
        consultationId
      );

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching prescriptions"
    });
  }
};