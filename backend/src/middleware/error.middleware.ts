import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Record already exists"
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found"
      });
      return;
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : "Internal Server Error"
  });
};