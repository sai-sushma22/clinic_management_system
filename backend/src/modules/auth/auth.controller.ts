import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required"
      });
      return;
    }

    const result = await authService.login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error &&
        error.message === "Invalid email or password") {
      res.status(401).json({ message: error.message });
      return;
    }

    next(error);
  }
};