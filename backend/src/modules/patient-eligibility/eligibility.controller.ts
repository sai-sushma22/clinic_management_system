import type { Request, Response, NextFunction } from "express";
import * as service from "./eligibility.service.js";

export const evaluateEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.evaluateEligibility(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEligibilityByPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      res.status(400).json({ message: "Patient ID is required" });
      return;
    }

    const result = await service.getEligibilityByPatient(String(patientId));
    res.json(result);
  } catch (error) {
    next(error);
  }
};