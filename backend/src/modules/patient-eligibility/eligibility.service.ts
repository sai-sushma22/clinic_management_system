import { EligibilityStatus } from "@prisma/client";
import prisma from "../../config/database.js";

interface EvaluateEligibilityData {
  patientId: string;
  studyId: string;
}

export const evaluateEligibility = async (
  data: EvaluateEligibilityData
) => {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId }
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const study = await prisma.clinicalStudy.findUnique({
    where: { id: data.studyId }
  });

  if (!study || !study.isActive) {
    throw new Error("Active clinical study not found");
  }

  const criteria = study.criteria as {
    minAge?: number;
    maxAge?: number;
    maxBMI?: number;
  };

  const reasons: string[] = [];
  let status: EligibilityStatus = EligibilityStatus.POTENTIAL_MATCH;

  const needsAge = criteria.minAge !== undefined ||
    criteria.maxAge !== undefined;
  const needsBMI = criteria.maxBMI !== undefined;

  if (needsAge) {
    if (!patient.dateOfBirth) {
      status = EligibilityStatus.NEEDS_REVIEW;
      reasons.push("Patient date of birth is missing");
    } else {
      const today = new Date();
      const dob = new Date(patient.dateOfBirth);
      let age = today.getFullYear() - dob.getFullYear();

      if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() &&
          today.getDate() < dob.getDate())
      ) {
        age--;
      }

      if (
        (criteria.minAge !== undefined && age < criteria.minAge) ||
        (criteria.maxAge !== undefined && age > criteria.maxAge)
      ) {
        status = EligibilityStatus.NOT_ELIGIBLE;
        reasons.push(`Patient age ${age} is outside the study age range`);
      } else {
        reasons.push("Patient age matches the study criteria");
      }
    }
  }

  if (needsBMI && status !== EligibilityStatus.NOT_ELIGIBLE) {
    const vital = await prisma.vital.findFirst({
      where: { patientId: data.patientId },
      orderBy: { recordedAt: "desc" }
    });

    if (!vital?.height || !vital.weight) {
      status = EligibilityStatus.NEEDS_REVIEW;
      reasons.push("Height or weight is missing for BMI calculation");
    } else {
      const heightInMeters = vital.height / 100;
      const bmi = vital.weight / (heightInMeters * heightInMeters);

      if (bmi > criteria.maxBMI!) {
        status = EligibilityStatus.NOT_ELIGIBLE;
        reasons.push(`BMI ${bmi.toFixed(1)} exceeds the study limit`);
      } else {
        reasons.push(`BMI ${bmi.toFixed(1)} matches the study criteria`);
      }
    }
  }

  if (reasons.length === 0) {
    reasons.push("No supported criteria were available for automatic evaluation");
    status = EligibilityStatus.NEEDS_REVIEW;
  }

  return prisma.patientEligibility.upsert({
    where: {
      patientId_studyId: {
        patientId: data.patientId,
        studyId: data.studyId
      }
    },
    update: {
      status,
      reasons
    },
    create: {
      patientId: data.patientId,
      studyId: data.studyId,
      status,
      reasons
    },
    include: {
      patient: true,
      study: true
    }
  });
};

export const getEligibilityByPatient = async (patientId: string) => {
  return prisma.patientEligibility.findMany({
    where: { patientId },
    include: { study: true },
    orderBy: { evaluatedAt: "desc" }
  });
};