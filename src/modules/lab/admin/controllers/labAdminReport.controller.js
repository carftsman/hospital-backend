import prisma from "../../../../prisma/client.js";
 
export const uploadLabReport = async (req, res) => {
  const { labBookingId, reportUrls, summary, reportStatus } = req.body;

  if (!labBookingId || !reportUrls) {
    return res.status(400).json({ message: "labBookingId and reportUrls required" });
  }

  const report = await prisma.labReport.upsert({
    where: { labBookingId },
    update: {
      reportUrls,
      summary,
      reportStatus
    },
    create: {
      labBookingId,
      reportUrls,
      summary,
      reportStatus
    }
  });

  // ✅ Mark booking completed
  await prisma.labBooking.update({
    where: { id: labBookingId },
    data: { status: "COMPLETED" }
  });

  res.json({
    message: "Report uploaded & booking marked COMPLETED",
    report
  });
};