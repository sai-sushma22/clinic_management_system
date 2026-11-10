import type { Request, Response, NextFunction } from "express";
import * as appointmentService from "./appointment.service.js";
import * as service from "./appointment.service.js";

interface CreateAppointmentBody {
  patientId: string;
  doctorId: string;
  date: string;
}

interface UpdateAppointmentBody {
  status: string;
}

export const createAppointment = async (
  req: Request<{}, {}, CreateAppointmentBody>,
  res: Response
) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Error creating appointment", error });
  }
};

export const getAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const status = req.query.status
      ? String(req.query.status)
      : undefined;

    const patientId = req.query.patientId
      ? String(req.query.patientId)
      : undefined;

    const physicianId = req.query.physicianId
      ? String(req.query.physicianId)
      : undefined;

    const search = req.query.search
      ? String(req.query.search).trim()
      : undefined;

    const appointments = await service.getAppointments(
      page,
      limit,
      status,
      patientId,
      physicianId,
      search
    );

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (
  req: Request<{ id: string }, {}, UpdateAppointmentBody>,
  res: Response
) => {
  try {
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id,
      req.body.status
    );
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment" });
  }
};