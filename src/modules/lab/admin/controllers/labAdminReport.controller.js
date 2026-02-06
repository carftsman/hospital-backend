import prisma from "../../../../prisma/client.js";
 
/**
 * UPLOAD lab report (Lab Admin)
 */
export const uploadLabReport = async (req, res) => {
  try {
    const { labBookingId, reportUrl } = req.body;
 
    if (!labBookingId || !reportUrl) {
      return res.status(400).json({
        message: "labBookingId and reportUrl are required",
      });
    }
 
    // ✅ 1. Check if booking exists FIRST
    const booking = await prisma.labBooking.findUnique({
      where: { id: labBookingId },
    });
 
    if (!booking) {
      return res.status(404).json({
        message: "Lab booking not found",
      });
    }
 
    // ✅ 2. Prevent duplicate report
    const existing = await prisma.labReport.findUnique({
      where: { labBookingId },
    });
 
    if (existing) {
      return res.status(409).json({
        message: "Report already uploaded for this booking",
      });
    }
 
    // ✅ 3. Create report
    const report = await prisma.labReport.create({
      data: {
        labBookingId,
        reportUrl,
      },
    });
 
    res.json({
      message: "Report uploaded successfully",
      report,
    });
  } catch (err) {
    console.error("uploadLabReport error:", err);
    res.status(500).json({ message: "Server error" });
  }
};