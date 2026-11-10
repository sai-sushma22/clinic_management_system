import prisma from "../../config/database.js";

export const createAppointment = async (data: any) => {
  return prisma.appointment.create({
    data: {
      patientId: data.patientId,
      physicianId: data.physicianId,
      date: new Date(data.date),
      reason: data.reason
    }
  });
};

export const getAppointments = async (
  page: number,
  limit: number,
  status?: string,
  patientId?: string,
  physicianId?: string,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status: status as any }),
    ...(patientId && { patientId }),
    ...(physicianId && { physicianId }),
    ...(search && {
      reason: {
        contains: search,
        mode: "insensitive" as const
      }
    })
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      include: {
        patient: true,
        physician: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    }),
    prisma.appointment.count({ where })
  ]);

  return {
    data: appointments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const updateAppointmentStatus = async (
  id: string,
  status: any
) => {
  return prisma.appointment.update({
    where: { id },
    data: { status }
  });
};