import prisma from "../../config/database.js";

interface CreateVitalData {
  patientId: string;
  nurseId: string;
  bloodPressure?: string;
  temperature?: number;
  pulse?: number;
  weight?: number;
  height?: number;
  oxygenLevel?: number;
}

export const createVital = async (data: CreateVitalData) => {
  return prisma.vital.create({
    data: {
      patientId: data.patientId,
      nurseId: data.nurseId,

      ...(data.bloodPressure !== undefined && {
        bloodPressure: data.bloodPressure
      }),
      ...(data.temperature !== undefined && {
        temperature: data.temperature
      }),
      ...(data.pulse !== undefined && {
        pulse: data.pulse
      }),
      ...(data.weight !== undefined && {
        weight: data.weight
      }),
      ...(data.height !== undefined && {
        height: data.height
      }),
      ...(data.oxygenLevel !== undefined && {
        oxygenLevel: data.oxygenLevel
      })
    }
  });
};

export const getVitalsByPatient = async (patientId: string) => {
  return prisma.vital.findMany({
    where: { patientId },
    include: {
      patient: true,
      nurse: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      recordedAt: "desc"
    }
  });
};