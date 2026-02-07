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
 * 📦 Get Lab Packages by Age
 * Screen: Labs → Age Selection → Packages
 */
export const getPackagesByAge = async (req, res) => {
  try {
    const age = Number(req.query.age);
    const labId = Number(req.query.labId);

    if (!age || !labId) {
      return res.status(400).json({
        message: "age and labId are required",
      });
    }

    const packages = await prisma.labTest.findMany({
      where: {
        labId,
        isAvailable: true,
        minAge: { lte: age },
        maxAge: { gte: age },
      },
      orderBy: {
        price: "asc",
      },
    });

    res.json({
      age,
      labId,
      packages,
    });
  } catch (error) {
    console.error("getPackagesByAge error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getRecommendedPackageByAge = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const age = Number(req.query.age);

    if (!labId || age === undefined) {
      return res.status(400).json({ message: "labId and age are required" });
    }

    // 1️⃣ Get all matching packages for age
    const packages = await prisma.labTest.findMany({
      where: {
        labId,
        minAge: { lte: age },
        maxAge: { gte: age },
        isAvailable: true,
      },
      orderBy: [
        { maxAge: "asc" }, // narrower age range
        { price: "desc" }  // premium preference
      ],
    });

    if (packages.length === 0) {
      return res.status(404).json({ message: "No packages found for this age" });
    }

    res.json({
      recommended: packages[0],   // ⭐ MAIN PACKAGE
      others: packages.slice(1),  // optional list
    });

  } catch (error) {
    console.error("getRecommendedPackageByAge error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabPackageDetails = async (req, res) => {
  try {
    const packageId = Number(req.params.packageId);

    if (!packageId) {
      return res.status(400).json({ message: "packageId is required" });
    }

    const pkg = await prisma.labTest.findUnique({
      where: { id: packageId },
      include: {
        lab: true,
        category: true,
      },
    });

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    // 🔹 Extract tests from description (temporary design)
    const testsIncluded = pkg.description
      ? pkg.description.split(",").map(t => t.trim())
      : [];

    // 🔹 Fake discount logic (frontend-friendly)
    const originalPrice = Math.round(pkg.price * 1.5);
    const discountedPrice = pkg.price;

    res.json({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price: discountedPrice,
      originalPrice,
      reportTime: pkg.reportTime,
      testsCount: testsIncluded.length,
      testsIncluded,
      instructions: [
        "Requires 10 - 12 hours of sleep and Overnight fasting. Only water is permitted",
        "Avoid alcohol and smoking 24 hours prior to the test",
      ],
      lab: {
        id: pkg.lab.id,
        name: pkg.lab.name,
      },
      category: pkg.category.name,
    });
  } catch (error) {
    console.error("getLabPackageDetails error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getUserPastLabBookings = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const bookings = await prisma.labBooking.findMany({
      where: {
        userId,
        status: {
          in: ["COMPLETED", "CANCELLED"],
        },
      },
      include: {
        lab: true,
        labTest: true,
        report: true, // useful for past bookings
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      type: "PAST",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("getUserPastLabBookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getUserUpcomingLabBookings = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const bookings = await prisma.labBooking.findMany({
      where: {
        userId,
        status: {
          in: ["PENDING", "SAMPLE_COLLECTED"],
        },
      },
      include: {
        lab: true,
        labTest: true,
      },
      orderBy: {
        sampleDate: "asc", // upcoming → nearest first
      },
    });

    res.json({
      type: "UPCOMING",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("getUserUpcomingLabBookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
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

  if (!Number.isInteger(labId)) {
    return res.status(400).json({ message: "Invalid labId" });
  }

  const lab = await prisma.lab.findUnique({
    where: { id: labId },
  });

  if (!lab) {
    return res.status(404).json({ message: "Lab not found" });
  }

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
  try {
    const { userId, labId, labTestId, sampleDate } = req.body;

    if (!userId || !labId || !labTestId || !sampleDate) {
      return res.status(400).json({
        message: "userId, labId, labTestId and sampleDate are required",
      });
    }

    const booking = await prisma.labBooking.create({
      data: {
        userId: Number(userId),
        labId: Number(labId),
        labTestId: Number(labTestId),
        sampleDate: new Date(sampleDate),
        status: "PENDING",
      },
    });

    res.json(booking);
  } catch (error) {
    console.error("bookLabTest error:", error);
    res.status(500).json({ message: "Server error" });
  }
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

// src/modules/lab/user/controllers/labReports.controller.js

export async function getUserLabReports(req, res) {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const reports = await prisma.labReport.findMany({
      where: {
        labBooking: { userId },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reportStatus: true,
        createdAt: true,
        labBooking: {
          select: {
            id: true,
            status: true,
            labTest: { select: { name: true } },
            lab: { select: { name: true } },
          },
        },
      },
    });

    const formatted = reports.map(r => ({
      reportId: r.id,
      bookingId: r.labBooking.id,
      reportStatus: r.reportStatus,
      bookingStatus: r.labBooking.status,
      testName: r.labBooking.labTest.name,
      labName: r.labBooking.lab.name,
      bookedDate: r.createdAt,
    }));

    res.json({ count: formatted.length, reports: formatted });
  } catch (err) {
    console.error("getUserLabReports error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


/* ===================== REPORT DETAILS ===================== */

// src/modules/lab/user/controllers/labReportDetails.controller.js
export const globalSearchLabs = async (req, res) => {
  const { query, labId, categoryId, minPrice, maxPrice } = req.query;

  if (!query) {
    return res.status(400).json({ message: "query is required" });
  }

  const tests = await prisma.labTest.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      ...(labId && { labId: Number(labId) }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(minPrice || maxPrice
        ? {
            price: {
              gte: Number(minPrice || 0),
              lte: Number(maxPrice || 99999)
            }
          }
        : {})
    },
    include: {
      lab: { select: { name: true } },
      category: { select: { name: true } }
    }
  });

  res.json({
    count: tests.length,
    results: tests.map(t => ({
      testId: t.id,
      testName: t.name,
      price: t.price,
      categoryName: t.category.name,
      labName: t.lab.name
    }))
  });
};

export const getLabSearchSuggestions = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "query required" });

  const [labs, categories, tests] = await Promise.all([
    prisma.lab.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true },
      take: 5
    }),
    prisma.labCategory.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true },
      take: 5
    }),
    prisma.labTest.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true },
      take: 5
    })
  ]);

  res.json({ labs, categories, tests });
};
export const globalSearchWithFilters = async (req, res) => {
  const { query, minPrice, maxPrice, labId, categoryId } = req.query;

  const tests = await prisma.labTest.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      ...(labId && { labId: Number(labId) }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(minPrice || maxPrice
        ? { price: { gte: Number(minPrice || 0), lte: Number(maxPrice || 99999) } }
        : {})
    },
    include: {
      lab: { select: { name: true } }
    }
  });

  res.json({
    count: tests.length,
    tests: tests.map(t => ({
      id: t.id,
      name: t.name,
      price: t.price,
      labName: t.lab.name
    }))
  });
};

export const autoSuggestLabs = async (req, res) => {
  const { query, limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return res.json({
      labs: [],
      categories: [],
      tests: []
    });
  }

  const take = Number(limit);

  const [labs, categories, tests] = await Promise.all([
    prisma.lab.findMany({
      where: {
        name: { startsWith: query, mode: "insensitive" }
      },
      select: { id: true, name: true },
      take
    }),
    prisma.labCategory.findMany({
      where: {
        name: { startsWith: query, mode: "insensitive" }
      },
      select: { id: true, name: true },
      take
    }),
    prisma.labTest.findMany({
      where: {
        name: { startsWith: query, mode: "insensitive" }
      },
      select: { id: true, name: true, price: true },
      take
    })
  ]);

  res.json({ labs, categories, tests });
};

export async function getLabReportDetails(req, res) {
  try {
    const bookingId = Number(req.params.bookingId);

    const booking = await prisma.labBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        collectedAt: true,
        reportIssuedAt: true,
        labTest: { select: { name: true } },
        lab: { select: { name: true } },
        report: {
          select: {
            reportStatus: true,
            summary: true,
            samples: true,
            reportUrls: true,
          },
        },
      },
    });

    if (!booking || !booking.report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({
      bookingId: booking.id,
      testName: booking.labTest.name,
      labName: booking.lab.name,
      collectedAt: booking.collectedAt,
      reportIssuedAt: booking.reportIssuedAt,
      reportStatus: booking.report.reportStatus,
      summary: booking.report.summary,
      samples: booking.report.samples,
      reports: booking.report.reportUrls.map(url => ({ url })),
    });
  } catch (err) {
    console.error("getLabReportDetails error:", err);
    res.status(500).json({ message: "Server error" });
  }
}



export const submitLabFeedback = async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    return res.status(400).json({ message: "bookingId and rating required" });
  }

  await prisma.labFeedback.create({
    data: {
      bookingId,
      rating,
      comment,
    },
  });

  res.json({ message: "Thank you for your feedback" });
};