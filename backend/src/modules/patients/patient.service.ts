import prisma from "../../config/database.js";

export const createPatient = async (data: any) => {
  const patientCode = `P-${Date.now()}`;

  return prisma.patient.create({
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth
        ? new Date(`${data.dateOfBirth}T00:00:00.000Z`)
        : undefined,
      patientCode,
    },
  });
};

export const getPatients = async (
  page: number,
  limit: number,
  search: string
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { patientCode: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } }
        ]
      }
    : {};

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.patient.count({ where })
  ]);

  return {
    data: patients,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getPatientById = async (id: string) => {
  return prisma.patient.findUnique({
    where: { id }
  });
};