import prisma from "../../../../prisma/client.js";

/**
 * 1️⃣ Nearby Labs
 */
export const getNearbyLabs = async (req, res) => {
  const { latitude, longitude, radius = 5 } = req.query;
  if (!latitude || !longitude)
    return res.status(400).json({ message: "Invalid coordinates" });

  const labs = await prisma.lab.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
  });

  const R = 6371;
  const nearby = labs
    .map(lab => {
      const dLat = ((lab.latitude - latitude) * Math.PI) / 180;
      const dLon = ((lab.longitude - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(latitude * Math.PI / 180) *
          Math.cos(lab.latitude * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...lab, distance: R * c };
    })
    .filter(l => l.distance <= radius);

  res.json(nearby);
};

/**
 * 2️⃣ Search Labs (NEW)
 */
export const searchLabs = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  const labs = await prisma.lab.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ],
    },
  });

  res.json(labs);
};

export const getUserLabReports = async (req, res) => {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(reports);
  } catch (err) {
    console.error("getUserLabReports error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
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

/**
 * 3️⃣ Lab Categories (GLOBAL)
 */
export const getLabCategories = async (req, res) => {
  const categories = await prisma.labCategory.findMany({
    select: { id: true, name: true },
  });
  res.json({ data: categories });
};

/**
 * 4️⃣ Lab Details
 */
export const getLabById = async (req, res) => {
  const labId = Number(req.params.labId);
  const lab = await prisma.lab.findUnique({ where: { id: labId } });
  if (!lab) return res.status(404).json({ message: "Lab not found" });
  res.json(lab);
};

/**
 * 5️⃣ Categories inside Lab
 */
export const getCategoriesByLab = async (req, res) => {
  const labId = Number(req.params.labId);
  const categories = await prisma.labCategory.findMany({ where: { labId } });
  res.json({ data: categories });
};

/**
 * 6️⃣ Lab Tests (Packages)
 */
export const getLabTests = async (req, res) => {
  const labId = Number(req.params.labId);
  const { categoryId } = req.query;

  const tests = await prisma.labTest.findMany({
    where: {
      labId,
      ...(categoryId && { categoryId: Number(categoryId) }),
    },
  });

  res.json({ labId, tests });
};

/**
 * 7️⃣ Search Tests (NEW)
 */
export const searchLabTests = async (req, res) => {
  const labId = Number(req.params.labId);
  const { query } = req.query;

  const tests = await prisma.labTest.findMany({
    where: {
      labId,
      name: { contains: query, mode: "insensitive" },
    },
  });

  res.json(tests);
};

/**
 * 8️⃣ Test Details (STRICT)
 */
export const getLabTestById = async (req, res) => {
  const id = Number(req.params.labTestId);
  const test = await prisma.labTest.findUnique({ where: { id } });
  if (!test) return res.status(404).json({ message: "Test not found" });
  res.json(test);
};

/**
 * 9️⃣ Lab Slots
 */
export const getLabSlots = async (req, res) => {
  const { labId } = req.params;
  const { date } = req.query;

  if (!labId || !date) {
    return res.status(400).json({ message: "labId and date required" });
  }

  // Static slots (can be DB later)
  const slots = [
    { id: 1, startTime: "09:00", endTime: "10:00", isBooked: false },
    { id: 2, startTime: "10:00", endTime: "11:00", isBooked: false },
    { id: 3, startTime: "11:00", endTime: "12:00", isBooked: true }
  ];

  res.json({ labId: Number(labId), date, slots });
};


/**
 * 🔟 Book Lab Test
 */
export const bookLabTest = async (req, res) => {
  const { userId, labId, labTestId, sampleDate } = req.body;
  const booking = await prisma.labBooking.create({
    data: { userId, labId, labTestId, sampleDate: new Date(sampleDate) },
  });
  res.json(booking);
};

/**
 * 1️⃣1️⃣ My Bookings
 */
export const getUserLabBookings = async (req, res) => {
  const userId = Number(req.query.userId);

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  const bookings = await prisma.labBooking.findMany({
    where: { userId },
    include: {
      lab: true,
      labTest: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(bookings);
};


/**
 * 1️⃣2️⃣ Cancel Booking
 */
export const cancelLabBooking = async (req, res) => {
  const bookingId = Number(req.params.bookingId);
  await prisma.labBooking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
  res.json({ message: "Booking cancelled" });
};

