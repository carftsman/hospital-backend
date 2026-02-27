import prisma from "../../../../src/prisma/client.js";

export const createHealthReport = (
  familyMemberId,
  url,
  type
) => {

  return prisma.familyReport.create({
    data: {
      familyMemberId,
      url,
      type
    }
  });
};

// GET BY ID (secure by user)
export const getHealthReportById = (id, userId) => {
  return prisma.familyReport.findFirst({
    where: {
      id,
      FamilyMember: {
        userId
      }
    }
  });
};

// GET ALL (for one family member)
export const getAllHealthReports = (familyMemberId, userId) => {
  return prisma.familyReport.findMany({
    where: {
      familyMemberId,
      FamilyMember: {
        userId
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

// DELETE BY ID (FIXED)
export const deleteHealthReport = async (id, userId) => {
  return await prisma.familyReport.deleteMany({
    where: {
      id: Number(id),   // 🔥 IMPORTANT FIX
      FamilyMember: {
        userId
      }
    }
  });
};