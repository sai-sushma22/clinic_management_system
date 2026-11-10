import prisma from "../../config/database.js";

interface CreateConsultationData {
  patientId: string;
  physicianId: string;
  diagnosis?: string;
  notes?: string;
}

export const createConsultation = async (
  data: CreateConsultationData
) => {
  return prisma.consultation.create({
    data: {
      patientId: data.patientId,
      physicianId: data.physicianId,
      ...(data.diagnosis !== undefined && {
        diagnosis: data.diagnosis
      }),

      ...(data.notes !== undefined && {
        notes: data.notes
      })
    },
    include: {
      patient: true,
      physician: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

export const getConsultationsByPatient = async (patientId: string) => {
  return prisma.consultation.findMany({
    where: { patientId },
    include: {
      physician: {
        select: {
          id: true,
          name: true
        }
      },
      prescriptions: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};