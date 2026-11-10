import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";

type Role = "RECEPTIONIST" | "NURSE" | "PHYSICIAN";

export const authorize = (...allowedRoles: Role[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      res.status(401).json({ message: "Please login first" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "You don't have permission to access this resource"
      });
      return;
    }

    next();
  };
};