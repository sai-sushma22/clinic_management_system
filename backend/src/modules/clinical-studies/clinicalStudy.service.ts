import prisma from "../../config/database.js";
import {Prisma} from "@prisma/client";

interface CreateStudyData {
  name: string;
  description?: string;
  criteria: Prisma.InputJsonObject;
}

export const createStudy = async (data: CreateStudyData) => {
  return prisma.clinicalStudy.create({
    data: {
      name: data.name,
      ...(data.description !== undefined && {
        description: data.description
      }),
      criteria: data.criteria
    }
  });
};

export const getStudies = async () => {
  return prisma.clinicalStudy.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });
};

export const getStudyById = async (id: string) => {
  return prisma.clinicalStudy.findUnique({
    where: { id }
  });
};