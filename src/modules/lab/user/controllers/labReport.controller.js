import prisma from "../../../../prisma/client.js";

/**
 * GET all reports for user
 */


/**
 * GET report by booking
 */
export const getLabReportByBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const report = await prisma.labReport.findFirst({
      where: { labBookingId: bookingId },
      include: {
        labBooking: {
          include: {
            labTest: {
              include: {
                lab: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (err) {
    console.error("getLabReportByBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getMyLabReports = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const reports = await prisma.labReport.findMany({
      where: {
        labBooking: {
          userId,
        },
      },
      include: {
        labBooking: {
          include: {
            labTest: {
              include: {
                lab: true,
              },
            },
          },
        },
      },
    });

    res.json({ data: reports });
  } catch (err) {
    console.error("getMyLabReports error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
