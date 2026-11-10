import type { Request, Response } from "express";
import * as vitalService from "./vital.service.js";

export const createVital = async (req: Request, res: Response) => {
  try {
    const vital = await vitalService.createVital(req.body);
    res.status(201).json(vital);
  } catch (error) {
    res.status(500).json({ message: "Error recording vitals", error });
  }
};

export const getVitalsByPatient = async (req: Request, res: Response) => {
  try {
    const patientId = req.params.patientId;

    if (typeof patientId !== "string") {
      res.status(400).json({ message: "Invalid patient ID" });
      return;
    }

    const vitals = await vitalService.getVitalsByPatient(patientId);
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vitals" });
  }
};