import prisma from "../../../../prisma/client.js";

export const getNearbyLabs = async (req, res) => {
  try {
    const lat = Number(req.query.latitude);
    const lon = Number(req.query.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const search = req.query.search;
    const sortBy = req.query.sortBy || "distance";
    const minRating = Number(req.query.minRating || 0);
    const maxRating = Number(req.query.maxRating || 5);

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    let radius = Number(req.query.radius || 5);
    const MAX_RADIUS = 30;
    const MIN_RESULTS = 10;

    const R = 6371;

    let finalLabs = [];

    // 🔁 Auto-expand radius until minimum labs found
    while (radius <= MAX_RADIUS && finalLabs.length < MIN_RESULTS) {
      const labs = await prisma.lab.findMany({
        where: {
          latitude: { not: null },
          longitude: { not: null },
          rating: { gte: minRating, lte: maxRating },
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } }
            ]
          })
        }
      });

      finalLabs = labs
        .map(lab => {
          const dLat = ((lab.latitude - lat) * Math.PI) / 180;
          const dLon = ((lab.longitude - lon) * Math.PI) / 180;

          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((lab.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) ** 2;

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          return {
            id: lab.id,
            name: lab.name,
            rating: lab.rating,
            isOpen: lab.isOpen,
            city: lab.city,
            distance: Number((R * c).toFixed(2))
          };
        })
        .filter(lab => lab.distance <= radius);

      radius += 5; // 🔼 expand radius
    }

    // 🧮 Sorting
    if (sortBy === "rating") {
      finalLabs.sort((a, b) => b.rating - a.rating);
    } else {
      finalLabs.sort((a, b) => a.distance - b.distance);
    }

    // 📄 Pagination
    const paginated = finalLabs.slice(skip, skip + limit);

    res.json({
      count: finalLabs.length,
      page,
      limit,
      labs: paginated
    });

  } catch (error) {
    console.error("getNearbyLabs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabPackageDetails = async (req, res) => {
  try {
    const packageId = Number(req.params.packageId);

    if (!packageId) {
      return res.status(400).json({ message: "packageId is required" });
    }

    const category = await prisma.labCategory.findUnique({
      where: { id: packageId },
      include: {
        Lab: {
          select: { id: true, name: true }
        },
        LabTest: {
          where: { isAvailable: true },
          select: {
            name: true,
            price: true,
            reportTime: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: "Package not found" });
    }

    // 💰 Pricing
    const prices = category.LabTest.map(t => t.price);
    const originalPrice = prices.reduce((a, b) => a + b, 0);
    const finalPrice = Math.round(originalPrice * 0.7);
    const discountPercent =
      originalPrice > 0
        ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
        : 0;

    // ✅ DEDUPE TEST NAMES
    const uniqueTests = [
      ...new Set(category.LabTest.map(t => t.name))
    ];

    res.json({
      id: category.id,
      name: category.name,
      summary: {
        testsCount: uniqueTests.length,
        reportTime: category.LabTest[0]?.reportTime ?? null
      },
      testsIncluded: [
        {
          category: category.name,
          tests: uniqueTests
        }
      ],
      instructions: [
        "Requires 10–12 hours of overnight fasting",
        "Only water is permitted",
        "Avoid alcohol and smoking 24 hours prior to the test"
      ],
      pricing: {
        originalPrice,
        finalPrice,
        discountPercent,
        currency: "INR",
        offerTag: "Limited time offer"
      },
      lab: category.Lab
    });

  } catch (error) {
    console.error("getLabPackageDetails error:", error);
    res.status(500).json({ message: "Server error" });
  }
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




export const getUserPastLabBookings = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

const bookings = await prisma.labBooking.findMany({
  where: {
    userId,
    status: { in: ["COMPLETED", "CANCELLED"] }
  },
  include: {
    Lab: true,
    LabTest: true,
    LabReport: true
  },
  orderBy: { createdAt: "desc" }
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
        status: { in: ["PENDING", "SAMPLE_COLLECTED"] }
      },
      include: {
        Lab: true,
        LabTest: true
      },
      orderBy: { sampleDate: "asc" }
    });

    res.json({
      type: "UPCOMING",
      count: bookings.length,
      bookings
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
      Lab: { select: { name: true } },
      LabCategory: { select: { name: true } }
    }
  });

  res.json({
    count: tests.length,
    results: tests.map(t => ({
      testId: t.id,
      testName: t.name,
      price: t.price,
      categoryName: t.LabCategory?.name ?? null,
      labName: t.Lab?.name ?? null
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
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({
        message: "bookingId and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "rating must be between 1 and 5"
      });
    }

    // prevent duplicate feedback for same booking
    const existing = await prisma.labFeedback.findFirst({
      where: { bookingId }
    });

    if (existing) {
      return res.status(409).json({
        message: "Feedback already submitted for this booking"
      });
    }

    await prisma.labFeedback.create({
      data: {
        bookingId: Number(bookingId),
        rating,
        comment
      }
    });

    res.json({
      message: "Thank you for your feedback"
    });

  } catch (error) {
    console.error("submitLabFeedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};