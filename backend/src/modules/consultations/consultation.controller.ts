import type { Request, Response } from "express";
import * as consultationService from "./consultation.service.js";

export const createConsultation = async (
  req: Request,
  res: Response
) => {
  try {
    const consultation = await consultationService.createConsultation(req.body);
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: "Error creating consultation", error });
  }
};

export const getConsultationsByPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const patientId = req.params.patientId;

    if (typeof patientId !== "string") {
      res.status(400).json({ message: "Invalid patient ID" });
      return;
    }

    const consultations =
      await consultationService.getConsultationsByPatient(patientId);

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching consultations" });
  }
};