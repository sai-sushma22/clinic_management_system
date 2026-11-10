import type { Request, Response, NextFunction } from "express";
import * as service from "./patient.service.js";

export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request body:", req.body);

    const patient = await service.createPatient(req.body);

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const search = String(req.query.search ?? "").trim();

    const patients = await service.getPatients(page, limit, search);

    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({ message: "Invalid patient ID" });
      return;
    }

    const patient = await service.getPatientById(id);

    res.json(patient);
  } catch (error) {
    next(error);
  }
};