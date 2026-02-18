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

    const minFee = req.query.minFee ? Number(req.query.minFee) : null;
    const maxFee = req.query.maxFee ? Number(req.query.maxFee) : null;

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    let radius = Number(req.query.radius || 5);
    const MAX_RADIUS = 30;
    const MIN_RESULTS = 10;

    const R = 6371; // earth radius km
    let finalLabs = [];

    // 🔁 Auto expand radius until enough labs found
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
        },
        include: {
          tests: {
            select: { price: true }
          }
        }
      });

      finalLabs = labs
        .map(lab => {
          // 📍 Distance calculation (Haversine)
          const dLat = ((lab.latitude - lat) * Math.PI) / 180;
          const dLon = ((lab.longitude - lon) * Math.PI) / 180;

          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((lab.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) ** 2;

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = Number((R * c).toFixed(2));

          // 💰 Min test price = fee
          const minTestPrice = lab.tests.length
            ? Math.min(...lab.tests.map(t => t.price))
            : 0;

          return {
            id: lab.id,
            name: lab.name,
            imageUrl: lab.imageUrl || null, // ✅ added
            rating: lab.rating,
            isOpen: lab.isOpen,
            city: lab.city,
            distance,
            startingFee: minTestPrice // ⭐ fee for UI
          };
        })
        .filter(lab => {
          // radius filter
          if (lab.distance > radius) return false;

          // fee range filter
          if (minFee && lab.startingFee < minFee) return false;
          if (maxFee && lab.startingFee > maxFee) return false;

          return true;
        });

      radius += 5;
    }

    // 🔄 Sorting
    if (sortBy === "rating") {
      finalLabs.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "popularity") {
      finalLabs.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
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
 
    if (!Number.isInteger(packageId) || packageId <= 0) {
      return res.status(400).json({ message: "Invalid packageId" });
    }
 
    const pkg = await prisma.labPackage.findUnique({
      where: { id: packageId },
      include: {
        items: {
          include: {
            test: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        lab: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
 
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }
 
    const tests = pkg.items.map(i => i.test);
 
    const originalPrice = tests.reduce((sum, t) => sum + t.price, 0);
    const finalPrice = pkg.finalPrice;
 
    res.json({
      packageId: pkg.id,
      packageName: pkg.name,
      labName: pkg.lab.name,
 
      testsCount: tests.length,
      tests: tests.map(t => t.name),
 
      reportTime: pkg.reportTime,
 
      instructions: pkg.instructions
        ? pkg.instructions.split("\n")   // if stored as text in DB
        : [
            "Requires 10–12 hours fasting",
            "Avoid alcohol 24 hours before test",
            "Inform doctor if on medication"
          ],
 
      pricing: {
        originalPrice,
        finalPrice,
        discountPercent:
          originalPrice > 0
            ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
            : 0,
        currency: "INR"
      }
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
  const userId = Number(req.query.userId);

 const bookings = await prisma.labBooking.findMany({
  where: {
    userId: 21,
    status: { in: ["COMPLETED", "CONFIRMED", "CANCELLED"] },
  },
  include: {
    lab: true,
    package: {
      include: {
        items: {
          include: { test: true }, // ✅ correct place
        },
      },
    },
  },
  orderBy: { createdAt: "desc" },
});


  const formatted = bookings.map(b => ({
    bookingId: b.id,
    labName: b.lab?.name,
    status: b.status,
    tests: b.package
      ? b.package.items.map(i => i.test.name)
      : b.LabTest
      ? [b.test?.name]
      : [],
    date: b.createdAt.toISOString().split("T")[0],
  }));

  res.json({ count: formatted.length, bookings: formatted });
};

 
 
export const getUserUpcomingLabBookings = async (req, res) => {
  const userId = Number(req.query.userId);

  const bookings = await prisma.labBooking.findMany({
  where: {
    userId: 21,
    status: { in: ["COMPLETED", "CONFIRMED", "CANCELLED"] },
  },
  include: {
    lab: true,
    package: {
      include: {
        items: {
          include: { test: true }, // ✅ correct place
        },
      },
    },
  },
  orderBy: { createdAt: "desc" },
});


  const formatted = bookings.map(b => ({
    bookingId: b.id,
    labName: b.lab?.name,
    sampleDate: b.sampleDate,
    tests: b.package
      ? b.package.items.map(i => i.test.name)
      : b.LabTest
      ? [b.test?.name]
      : [],
  }));

  res.json({ count: formatted.length, bookings: formatted });
};

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
 export const searchLabTests = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const { query } = req.query;

    if (!labId || !query) {
      return res.status(400).json({
        message: "labId and query are required"
      });
    }

    const tests = await prisma.labTest.findMany({
      where: {
        labId,
        name: { contains: query, mode: "insensitive" }
      }
    });

    res.json({
      count: tests.length,
      tests
    });

  } catch (error) {
    console.error("searchLabTests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getLabCategories = async (req, res) => {
  try {
    const { q } = req.query;

    // 1️⃣ Get distinct categories (remove duplicates by name + group)
    const categories = await prisma.labCategory.findMany({
      where: q
        ? {
            name: {
              contains: q,
              mode: "insensitive"
            }
          }
        : undefined,
      select: {
        id: true,
        name: true,
        group: true,
        imageUrl: true
      },
      orderBy: [
        { group: "asc" },
        { name: "asc" }
      ]
    });

    // 2️⃣ Remove duplicate names manually
    const uniqueMap = new Map();

    categories.forEach(cat => {
      const key = `${cat.name}-${cat.group}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, cat);
      }
    });

    const uniqueCategories = Array.from(uniqueMap.values());

    // 3️⃣ Group by section title
    const grouped = {};

    uniqueCategories.forEach(cat => {
      if (!grouped[cat.group]) {
        grouped[cat.group] = [];
      }

      grouped[cat.group].push({
        id: cat.id,
        name: cat.name,
        imageUrl: cat.imageUrl
      });
    });

    // 4️⃣ Convert to sections format
    const sections = Object.keys(grouped).map(groupName => ({
      sectionTitle: groupName,
      categories: grouped[groupName]
    }));

    res.status(200).json({
      sections
    });

  } catch (error) {
    console.error("getLabCategories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
 
    if (!labId) {
      return res.status(400).json({ message: "Invalid labId" });
    }
 
    const categories = await prisma.labCategory.findMany({
      where: {
        labId: labId
      },
      select: {
        id: true,
        name: true,
        group: true,
        imageUrl: true
      }
    });
 
    res.json({
      count: categories.length,
      data: categories
    });
 
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

 
export const getLabDetailsById = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
 
    if (!Number.isInteger(labId) || labId <= 0) {
      return res.status(400).json({ message: "Invalid labId" });
    }
 
    const lab = await prisma.lab.findUnique({
      where: { id: labId },
      include: {
        LabPackage: {
          include: {
            items: {
              include: {
                test: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
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
 
      packagesIncluded: lab.LabPackage.map(pkg => ({
       
        packageId: pkg.id,
      packageName: pkg.name,
        tests: pkg.items.map(item => item.test.name)
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
    const { search, page = 1, limit = 10 } = req.query;

    if (!labId) {
      return res.status(400).json({ message: "labId is required" });
    }

    const packages = await prisma.labPackage.findMany({
      where: {
        labId: Number(labId),
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive"
          }
        })
      },
      include: {
        items: {
          include: {
            test: true
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: "desc" }
    });

    const totalCount = await prisma.labPackage.count({
      where: {
        labId: Number(labId),
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive"
          }
        })
      }
    });

    res.json({
      count: totalCount,
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
        tests: p.items.map(item => item.test.name),
        testsCount: p.items.length,
        gender: p.gender
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
      minAge,
      maxAge,
      gender,
      sortBy = "price_low"
    } = req.query;

    if (!labId) {
      return res.status(400).json({ message: "labId is required" });
    }

    const filters = [];

    // 💰 Price Filter
    if (minPrice || maxPrice) {
      filters.push({
        finalPrice: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) })
        }
      });
    }

    // 👶 Age Filter
    if (minAge || maxAge) {
      filters.push({
        AND: [
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
        ]
      });
    }

    // 🚻 Gender Filter (ENUM Safe)
    if (gender) {
      const genderValue = gender.toUpperCase();

      if (genderValue === "ALL") {
        filters.push({ gender: "ALL" });
      } else {
        filters.push({
          OR: [
            { gender: "ALL" },
            { gender: genderValue }
          ]
        });
      }
    }

    // 🔄 Sorting
    const orderBy =
      sortBy === "price_high"
        ? { finalPrice: "desc" }
        : { finalPrice: "asc" };

    const packages = await prisma.labPackage.findMany({
      where: {
        labId: Number(labId),
        AND: filters
      },
      include: {
        items: {
          include: {
            test: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy
    });

    res.json({
      count: packages.length,
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
        tests: p.items.map(item => item.test.name),
        testsCount: p.items.length,
        gender: p.gender
      }))
    });

  } catch (error) {
    console.error("filterLabPackages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmLabBooking = async (req, res) => {
  try {
    const { bookingIds } = req.body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        message: "bookingIds array required"
      });
    }

    // 1️⃣ Fetch bookings
    const bookings = await prisma.labBooking.findMany({
      where: { id: { in: bookingIds } }
    });

    if (!bookings.length) {
      return res.status(404).json({
        message: "Bookings not found"
      });
    }

    // 2️⃣ Validate HOLD
    const invalid = bookings.find(b => b.status !== "HOLD");
    if (invalid) {
      return res.status(409).json({
        message: `Booking ${invalid.id} is not in HOLD state`
      });
    }

    // 3️⃣ Expiry check
    const now = new Date();
    const expired = bookings.find(b => b.expiresAt && now > b.expiresAt);

    if (expired) {
      return res.status(409).json({
        message: `Booking ${expired.id} expired`
      });
    }

    // 4️⃣ Confirm
    await prisma.labBooking.updateMany({
      where: { id: { in: bookingIds } },
      data: {
        status: "CONFIRMED",   // ⭐ SAME AS HOSPITAL FLOW
        expiresAt: null
      }
    });

    return res.json({
      message: "Booking confirmed successfully",
      bookingIds,
      confirmedCount: bookingIds.length,
      status: "CONFIRMED"
    });

  } catch (error) {
    console.error("confirmLabBooking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
 
 
 
 
export const getUserLabReports = async (req, res) => {
  const userId = Number(req.query.userId);

  const reports = await prisma.labReport.findMany({
  where: {
    booking: {
      userId,
      status: "COMPLETED",
    },
  },
include: {
  booking: {
    include: {
      lab: true,
      package: {
        include: {
          items: {
            include: {
              test: true // ✅ THIS IS OK (package tests)
            }
          }
        }
      }
    }
  }
}
,
  orderBy: { createdAt: "desc" },
});

  const formatted = reports.map(r => ({
    reportId: r.id,
    labName: r.booking.lab?.name,
    tests: r.booking.package
      ? r.booking.package.items.map(i => i.test.name)
      : r.booking.LabTest
      ? [r.booking.LabTest.name]
      : [],
    date: r.createdAt.toISOString().split("T")[0],
  }));

  res.json({ count: formatted.length, reports: formatted });
};

export const getLabReportDetails = async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);

    if (!reportId) {
      return res.status(400).json({
        message: "reportId is required"
      });
    }

    const report = await prisma.labReport.findUnique({
      where: { id: reportId }, // ✅ FIXED
      include: {
        booking: {
          include: {
            lab: true,
            package: {
              include: {
                items: {
                  include: { test: true }
                }
              }
            },
            patient: true,
            user: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        message: "Lab report not found"
      });
    }

    const booking = report.booking;

    let tests = [];
    if (booking.package) {
      tests = booking.package.items.map(i => i.test.name);
    }

    res.json({
      reportId: report.id,
      bookingId: report.labBookingId,
      labName: booking.lab?.name,
      tests,
      issuedDate: report.createdAt.toISOString().split("T")[0],
      resultSummary: report.summary || "No summary available.",
      reports: report.reportUrls?.map(url => ({
        name: "Report",
        url
      })) || []
    });

  } catch (error) {
    console.error("getLabReportDetails error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getLast30DaysLabTests = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
 
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
 
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
 
    const bookings = await prisma.labBooking.findMany({
      where: {
        userId,
        status: "COMPLETED",
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        lab: true,
        test: true
      },
      orderBy: { createdAt: "desc" }
    });
 
    // 🔥 Remove duplicates by testId
    const uniqueTests = [];
    const seen = new Set();
 
    for (const booking of bookings) {
      if (!seen.has(booking.labTestId)) {
        seen.add(booking.labTestId);
        uniqueTests.push(booking);
      }
    }
 
    res.json({
      userId,
      last30DaysCount: uniqueTests.length,
      tests: uniqueTests.map(b => ({
        testId: b.test.id,
        testName: b.test.name,
        labName: b.lab.name,
        price: b.test.price,
        date: b.createdAt.toISOString().split("T")[0]
      }))
    });
 
  } catch (error) {
    console.error("getLast30DaysLabTests error:", error);
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
 
    if (!reportId) {
      return res.status(400).json({ message: "reportId is required" });
    }
 
    const report = await prisma.labReport.findUnique({
      where: { id: reportId },
      select: { reportUrls: true }
    });
 
    if (
      !report ||
      !Array.isArray(report.reportUrls) ||
      report.reportUrls.length === 0
    ) {
      return res.status(404).json({ message: "Report file not found" });
    }
 
    const fileUrl = report.reportUrls[0];
 
    res.setHeader("Content-Disposition", "attachment");
    return res.redirect(fileUrl);
 
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
        message: "bookingId and rating are required",
      });
    }

    // 1️⃣ Check booking exists
    const booking = await prisma.labBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // 2️⃣ Allow feedback only after completion
    if (booking.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Feedback allowed only for completed bookings",
      });
    }

    // 3️⃣ Prevent duplicate feedback
    const existing = await prisma.labFeedback.findUnique({
      where: { bookingId },
    });

    if (existing) {
      return res.status(409).json({
        message: "Feedback already submitted",
      });
    }

    // 4️⃣ Create feedback
    await prisma.labFeedback.create({
      data: {
        bookingId,
        rating,
        comment,
      },
    });

    res.json({
      message: "Thank you for your feedback ❤️",
    });
  } catch (error) {
    console.error("submitLabFeedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

 
export const getRecentLabTests = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    const limit = Number(req.query.limit || 5);
 
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
 
    const bookings = await prisma.labBooking.findMany({
      where: {
        userId,
        status: "COMPLETED"
      },
      include: {
        test: true,
        lab: true
      },
      orderBy: { createdAt: "desc" }
    });
 
    // 🧠 Remove duplicates by testId
    const unique = [];
    const seen = new Set();
 
    for (const b of bookings) {
      if (!seen.has(b.labTestId)) {
        seen.add(b.labTestId);
        unique.push(b);
      }
      if (unique.length === limit) break;
    }
 
    res.json({
      count: unique.length,
      tests: unique.map(b => ({
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
}