import prisma from "../../config/database.js";

interface CreatePrescriptionData {
  consultationId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export const createPrescription = async (
  data: CreatePrescriptionData
) => {
  return prisma.prescription.create({
    data: {
      consultationId: data.consultationId,
      medicineName: data.medicineName,
      dosage: data.dosage,
      frequency: data.frequency,
      ...(data.duration !== undefined && {
      duration: data.duration
    })
    },
    include: {
      consultation: {
        include: {
          patient: true,
          physician: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
};

export const getPrescriptionsByConsultation = async (
  consultationId: string
) => {
  return prisma.prescription.findMany({
    where: { consultationId },
    orderBy: {
      id: "desc"
    }
  });
};