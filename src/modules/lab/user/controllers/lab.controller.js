import prisma from "../../../../prisma/client.js";

/**
 * GET nearby labs (FIXED)
 */
/**
 * GET nearby labs (SAFE VERSION)
 */
export const getNearbyLabs = async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radiusKm = Number(req.query.radius || 5);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    // Fetch all labs with coordinates
    const labs = await prisma.lab.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    // Haversine formula in JS (NO DB math)
    const nearbyLabs = labs
      .map(lab => {
        const R = 6371;
        const dLat = ((lab.latitude - latitude) * Math.PI) / 180;
        const dLon = ((lab.longitude - longitude) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((latitude * Math.PI) / 180) *
            Math.cos((lab.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return { ...lab, distance };
      })
      .filter(lab => lab.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyLabs);
  } catch (err) {
    console.error("getNearbyLabs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/**
 * GET all categories OR categories for a lab
 */
/**
 * GET categories for a specific lab
 */
export const getLabCategories = async (req, res) => {
  try {
    const categories = await prisma.labCategory.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    res.json({ data: categories });
  } catch (err) {
    console.error("getLabCategories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabTests = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const categoryId = Number(req.query.categoryId);

    if (!labId) {
      return res.status(400).json({ message: "Invalid labId" });
    }

    const tests = await prisma.labTest.findMany({
      where: {
        labId,
        isAvailable: true,
        ...(categoryId && { categoryId }),
      },
    });

    res.json({ labId, tests });
  } catch (err) {
    console.error("getLabTests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * BOOK lab test
 */
export const bookLabTest = async (req, res) => {
  try {
    const { userId, labId, labTestId, sampleDate } = req.body;

    if (!userId || !labId || !labTestId || !sampleDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const booking = await prisma.labBooking.create({
      data: {
        userId,
        labId,
        labTestId,
        sampleDate: new Date(sampleDate),
        status: "PENDING"
      }
    });

    res.json({ message: "Lab booking created", booking });
  } catch (err) {
    console.error("bookLabTest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET user lab bookings
 */
export const getUserLabBookings = async (req, res) => {
  const userId = Number(req.query.userId);

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  const bookings = await prisma.labBooking.findMany({
    where: { userId },
    include: { lab: true, labTest: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(bookings);
};

/**
 * GET booking details
 */
export const getLabBookingDetails = async (req, res) => {
  const bookingId = Number(req.params.bookingId);
  const userId = Number(req.query.userId);

  if (!bookingId || !userId) {
    return res.status(400).json({ message: "bookingId and userId required" });
  }

  const booking = await prisma.labBooking.findFirst({
    where: { id: bookingId, userId },
    include: {
      lab: true,
      labTest: true,
      report: true,
    },
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  res.json(booking);
};


/**
 * CANCEL booking
 */
export const cancelLabBooking = async (req, res) => {
  const bookingId = Number(req.params.bookingId);
  const userId = Number(req.query.userId);

  const booking = await prisma.labBooking.findFirst({
    where: { id: bookingId, userId }
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  await prisma.labBooking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" }
  });

  res.json({ message: "Booking cancelled" });
};

/**
 * GET lab report
 */

export const getCategoriesByLab = async (req, res) => {
  try {
    const labId = Number(req.params.labId);

    if (!labId) {
      return res.status(400).json({ message: "Invalid labId" });
    }

    // Step 1: get distinct categoryIds from lab tests
    const categoryIds = await prisma.labTest.findMany({
      where: { labId },
      distinct: ["categoryId"],
      select: { categoryId: true },
    });

    // Step 2: fetch categories
    const categories = await prisma.labCategory.findMany({
      where: {
        id: {
          in: categoryIds.map(c => c.categoryId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.json({ data: categories });
  } catch (err) {
    console.error("getCategoriesByLab error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabById = async (req, res) => {
  try {
    const labId = Number(req.params.labId);

    if (!labId) {
      return res.status(400).json({ message: "Invalid labId" });
    }

    const lab = await prisma.lab.findUnique({
      where: { id: labId },
    });

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json(lab);
  } catch (err) {
    console.error("getLabById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
