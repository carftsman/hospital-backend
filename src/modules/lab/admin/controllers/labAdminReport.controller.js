import prisma from "../../../../prisma/client.js";
 
/**
 * UPLOAD lab report (Lab Admin)
 */
export const uploadLabReport = async (req, res) => {
  const { bookingId, reportUrls } = req.body;

  if (!bookingId || !Array.isArray(reportUrls)) {
    return res.status(400).json({
      message: "bookingId and reportUrls[] required",
    });
  }

  const report = await prisma.labReport.upsert({
    where: { bookingId },
    update: {
      reportUrls,
      reportStatus: "READY",
    },
    create: {
      bookingId,
      reportUrls,
      reportStatus: "READY",
    },
  });

  res.json({
    message: "Lab report uploaded successfully",
    report,
  });
};
