import type { Request, Response, NextFunction } from "express";
import * as service from "./clinicalStudy.service.js";

export const createStudy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const study = await service.createStudy(req.body);
    res.status(201).json(study);
  } catch (error) {
    next(error);
  }
};

export const getStudies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studies = await service.getStudies();
    res.json(studies);
  } catch (error) {
    next(error);
  }
};

export const getStudyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Study ID is required" });
      return;
    }

    const study = await service.getStudyById(String(id));

    if (!study) {
      res.status(404).json({ message: "Study not found" });
      return;
    }

    res.json(study);
  } catch (error) {
    next(error);
  }
};