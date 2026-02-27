import {
  createHealthReport,
  getHealthReportById,
  getAllHealthReports,
  deleteHealthReport
} from "../repositories/familyReports.repositeries.js";

import { uploadToAzure } from "../../../utils/azureBlob.js";

import prisma from "../../../../src/prisma/client.js";


// UPLOAD MULTIPLE FILES
export const addHealthReportService = async (
  familyMemberId,
  files,
  userId
) => {

  // 🔐 SECURITY CHECK
  const member = await prisma.familyMember.findFirst({
    where: {
      id: familyMemberId,
      userId
    }
  });

  if (!member) {
    throw new Error("Unauthorized family member");
  }

  const uploadedReports = [];

  for (const file of files) {

    const url = await uploadToAzure(file, "health-reports");

    const report = await createHealthReport(
      familyMemberId,
      url,
      file.mimetype
    );

    uploadedReports.push(report);
  }

  return uploadedReports;
};


// GET BY ID
export const getHealthReportByIdService = async (
  id,
  userId
) => {

  const report = await getHealthReportById(id, userId);

  if (!report) {
    throw new Error("Report not found or unauthorized");
  }

  return report;
};


// GET ALL
export const getAllHealthReportsService = async (
  familyMemberId,
  userId
) => {

  return await getAllHealthReports(
    familyMemberId,
    userId
  );
};


// DELETE
export const deleteHealthReportService = async (id, userId) => {

  const deleted = await deleteHealthReport(id, userId);

  if (deleted.count === 0) {
    throw new Error("Report not found");
  }

  return {
    message: "Health report deleted successfully"
  };
};