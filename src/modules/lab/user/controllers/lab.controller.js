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
        labs: {
          select: {
            id: true,
            name: true
          }
        },
        tests: {
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
    const prices = category.tests.map(t => t.price);
    const originalPrice = prices.reduce((a, b) => a + b, 0);
    const finalPrice = Math.round(originalPrice * 0.7);
    const discountPercent =
      originalPrice > 0
        ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
        : 0;

    // ✅ Unique test names
    const uniqueTests = [...new Set(category.tests.map(t => t.name))];

    res.json({
      id: category.id,
      name: category.name,
      summary: {
        testsCount: uniqueTests.length,
        reportTime: category.tests[0]?.reportTime ?? null
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
      labs: category.labs
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
        message: "age and labId are required"
      });
    }

    const packages = await prisma.labTest.findMany({
      where: {
        labId,
        isAvailable: true,
        AND: [
          {
            OR: [
              { minAge: null },
              { minAge: { lte: age } }
            ]
          },
          {
            OR: [
              { maxAge: null },
              { maxAge: { gte: age } }
            ]
          }
        ]
      },
      orderBy: {
        price: "asc"
      }
    });

    res.json({
      age,
      labId,
      count: packages.length,
      packages
    });
  } catch (error) {
    console.error("getPackagesByAge error:", error);
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
        lab: true,     // ✅ correct
        test: true     // ✅ correct
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      type: "PAST",
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("getUserPastLabBookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getUserUpcomingLabBookings = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    const bookings = await prisma.labBooking.findMany({
      where: {
        userId,
        status: { in: ["PENDING", "SAMPLE_COLLECTED"] }
      },
      include: {
        lab: true,
        test: true
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
  try {
    const categories = await prisma.labCategory.findMany({
      distinct: ['name'],
      select: {
        id: true,
        name: true,
        group: true,
        imageUrl: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json({
      data: categories
    });

  } catch (error) {
    console.error("getLabCategories error:", error);
    return res.status(500).json({
      message: "Failed to fetch lab categories"
    });
  }
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
  try {
    const labId = Number(req.params.labId);

    const categories = await prisma.labCategory.findMany({
      where: {
        labs: {
          some: { id: labId }
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    res.json({ data: categories });
  } catch (error) {
    console.error("getCategoriesByLab error:", error);
    res.status(500).json({ message: "Server error" });
  }
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
 
export const getLabDetailsById = async (req, res) => {
  try {
    const labId = Number(req.params.labId);

    const lab = await prisma.lab.findUnique({
      where: { id: labId },
      select: {
        id: true,
        name: true,
        rating: true,
        city: true,
        isOpen: true,
        categories: {
          select: {
            id: true,
            name: true,
            tests: {
              where: { isAvailable: true },
              select: { name: true }
            }
          }
        }
      }
    });

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json({
      id: lab.id,
      name: lab.name,
      rating: lab.rating,
      city: lab.city,
      isOpen: lab.isOpen,
      packagesIncluded: lab.categories.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        testsCount: pkg.tests.length,
        tests: [...new Set(pkg.tests.map(t => t.name))]
      }))
    });

  } catch (error) {
    console.error("getLabDetailsById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabPackages = async (req, res) => {
  try {
    const { labId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const packages = await prisma.labPackage.findMany({
      where: {
        labId: Number(labId)
      },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: Number(limit)
    });

    res.json({
      count: packages.length,
      page: Number(page),
      limit: Number(limit),
      packages: packages.map(p => ({
        packageId: p.id,
        packageName: p.name,
        originalPrice: p.originalPrice,
        finalPrice: p.finalPrice,
        discountPercent:
          p.originalPrice > 0
            ? Math.round(
                ((p.originalPrice - p.finalPrice) / p.originalPrice) * 100
              )
            : 0,
        reportTime: p.reportTime,
        testsCount: p._count.items
      }))
    });

  } catch (error) {
    console.error("getLabPackages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const filterLabPackages = async (req, res) => {
  try {
    const { labId } = req.params;
    const {
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      minAge,
      maxAge,
      sortBy = "price_asc"
    } = req.query;

    const where = {
      labId: Number(labId)
    };

    // 💰 Price Filter
    if (minPrice || maxPrice) {
      where.finalPrice = {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) })
      };
    }

    // ⭐ Rating Filter
    if (minRating || maxRating) {
      where.lab = {
        rating: {
          ...(minRating && { gte: Number(minRating) }),
          ...(maxRating && { lte: Number(maxRating) })
        }
      };
    }

    // 👶 Age Filter (using LabPackage minage/maxage)
    if (minAge || maxAge) {
      where.AND = [
        {
          OR: [
            { minage: null },
            { minage: { lte: Number(maxAge || 200) } }
          ]
        },
        {
          OR: [
            { maxage: null },
            { maxage: { gte: Number(minAge || 0) } }
          ]
        }
      ];
    }

    // 🔄 Sorting
    let orderBy = { finalPrice: "asc" };

    if (sortBy === "price_desc") {
      orderBy = { finalPrice: "desc" };
    }

    if (sortBy === "rating") {
      orderBy = {
        lab: { rating: "desc" }
      };
    }

    const packages = await prisma.labPackage.findMany({
      where,
      include: {
        lab: {
          select: {
            id: true,
            name: true,
            rating: true,
            city: true
          }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy
    });

    res.json({
      count: packages.length,
      packages: packages.map(p => ({
        packageId: p.id,
        packageName: p.name,
        labName: p.lab?.name,
        rating: p.lab?.rating,
        originalPrice: p.originalPrice,
        finalPrice: p.finalPrice,
        discountPercent:
          p.originalPrice > 0
            ? Math.round(
                ((p.originalPrice - p.finalPrice) / p.originalPrice) * 100
              )
            : 0,
        testsCount: p._count.items,
        reportTime: p.reportTime
      }))
    });

  } catch (error) {
    console.error("filterLabPackages error:", error);
    res.status(500).json({ message: "Server error" });
  }
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
        message: "userId, labId, labTestId and sampleDate are required"
      });
    }

    const booking = await prisma.labBooking.create({
      data: {
        userId: Number(userId),
        labId: Number(labId),
        labTestId: Number(labTestId),
        sampleDate: new Date(sampleDate),
        status: "PENDING" // ✅ VALID ENUM
      }
    });

    res.status(201).json({
      message: "Lab booking created",
      booking
    });

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




/* ===================== REPORT DETAILS ===================== */

// src/modules/lab/user/controllers/labReportDetails.controller.js
export const globalSearchLabs = async (req, res) => {
  try {
    const { query, labId, categoryId, minPrice, maxPrice } = req.query;

    if (!query) {
      return res.status(400).json({ message: "query is required" });
    }

    /* 1️⃣ Labs */
    const labs = await prisma.lab.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        rating: true,
        city: true,
        isOpen: true
      },
      take: 5
    });

    /* 2️⃣ Categories */
    const categories = await prisma.labCategory.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      select: {
        id: true,
        name: true
      },
      take: 5
    });

    /* 3️⃣ Tests (RAW) */
    const rawTests = await prisma.labTest.findMany({
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
        lab: { select: { id: true, name: true } }
      }
    });

    /* 4️⃣ GROUP TESTS BY NAME */
    const groupedTests = {};

    rawTests.forEach(test => {
      if (!groupedTests[test.name]) {
        groupedTests[test.name] = {
          name: test.name,
          minPrice: test.price,
          maxPrice: test.price,
          labs: []
        };
      }

      groupedTests[test.name].minPrice = Math.min(
        groupedTests[test.name].minPrice,
        test.price
      );

      groupedTests[test.name].maxPrice = Math.max(
        groupedTests[test.name].maxPrice,
        test.price
      );

      groupedTests[test.name].labs.push({
        testId: test.id,
        labId: test.lab.id,
        labName: test.lab.name,
        price: test.price
      });
    });

    res.json({
      labs,
      categories,
      tests: Object.values(groupedTests)
    });

  } catch (error) {
    console.error("globalSearchLabs error:", error);
    res.status(500).json({ message: "Server error" });
  }
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

  res.json({
    labs,
    categories,
    tests: tests.map(t => ({
      id: t.id,
      name: t.name,
      startingPrice: t.price
    }))
  });
};

/**
 * ===============================
 * 📄 REPORTS LIST (UI MATCH)
 * Screen: Reports List
 * ===============================
 */

/**
 * ===============================
 * 📄 REPORTS LIST (UI MATCH)
 * Screen: Reports List
 * ===============================
 */
// src/modules/lab/user/controllers/lab.controller.js

export const getUserLabReports = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    const { reportStatus, fromDate, toDate } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // 🔁 Normalize UI chip → ENUM
    const normalizedStatus = reportStatus
      ? reportStatus.toUpperCase() // Normal → NORMAL
      : undefined;

    // 📅 Date handling (important)
    const from = fromDate ? new Date(fromDate) : undefined;
    const to = toDate
      ? new Date(new Date(toDate).setHours(23, 59, 59, 999))
      : undefined;

    const reports = await prisma.labReport.findMany({
      where: {
        booking: {
          userId,
          status: "COMPLETED" // 🔒 only completed bookings
        },

        ...(normalizedStatus && {
          reportStatus: normalizedStatus
        }),

        ...(from || to
          ? {
              createdAt: {
                ...(from && { gte: from }),
                ...(to && { lte: to })
              }
            }
          : {})
      },

      include: {
        booking: {
          include: {
            lab: { select: { name: true } },
            test: { select: { name: true } }
          }
        }
      },

      orderBy: { createdAt: "desc" }
    });

    res.json({
      count: reports.length,
      reports: reports.map(r => ({
        reportId: r.id,
        bookingId: r.labBookingId,
        status: r.reportStatus, // NORMAL | ABNORMAL | BORDERLINE
        testName: r.booking.test.name,
        testsCount: 12, // static (UI requirement)
        labName: r.booking.lab.name,
        date: r.createdAt.toISOString().split("T")[0]
      }))
    });
  } catch (error) {
    console.error("getUserLabReports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/**
 * ===============================
 * 📄 REPORT DETAILS (UI MATCH)
 * Screen: Detailed Report
 * ===============================
 */
export const getLabReportDetails = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const report = await prisma.labReport.findFirst({
      where: { labBookingId: bookingId },
      include: {
        booking: {
          include: {
            lab: { select: { name: true } },
            test: { select: { name: true } }
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ message: "Lab report not found" });
    }

    res.json({
      reportId: report.id,
      bookingId,
      packageName: report.booking.test.name,
      labName: report.booking.lab.name,
      collectedDate: report.collectedAt
        ? report.collectedAt.toISOString().split("T")[0]
        : null,
      issuedDate: report.createdAt.toISOString().split("T")[0],
      samplesCollected: ["Blood Samples", "Urine Samples"],
      resultSummary:
        report.summary ||
        "Your blood sugar level is higher than normal. Reducing sugar intake and consulting a doctor is advised.",
      reports: report.reportUrls.map((url, index) => ({
        name: `Report-${index + 1}`,
        url
      }))
    });
  } catch (error) {
    console.error("getLabReportDetails error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ===============================
 * 📥 DOWNLOAD REPORT
 * ===============================
 */
export const downloadLabReport = async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);

    const report = await prisma.labReport.findUnique({
      where: { id: reportId },
      select: { reportUrls: true }
    });

    if (!report || !report.reportUrls?.length) {
      return res.status(404).json({ message: "Report file not found" });
    }

    return res.redirect(report.reportUrls[0]);
  } catch (error) {
    console.error("downloadLabReport error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





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
// src/modules/lab/user/controllers/recentTests.controller.js


export const getRecentLabTests = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const bookings = await prisma.labBooking.findMany({
      where: {
        userId,
        status: "COMPLETED"
      },
      include: {
        test: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        lab: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5 // 🔥 UI limit
    });

    res.json({
      count: bookings.length,
      tests: bookings.map(b => ({
        testId: b.test.id,
        testName: b.test.name,
        price: b.test.price,
        labId: b.lab.id,
        labName: b.lab.name,
        lastBookedOn: b.createdAt.toISOString().split("T")[0]
      }))
    });

  } catch (error) {
    console.error("getRecentLabTests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

