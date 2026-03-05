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

    const pkg = await prisma.labPackage.findUnique({
      where: { id: packageId },
      include: {
        items: {
          include: {
            test: {
              select: {
                name: true,
                category: {
                  select: { name: true }
                }
              }
            }
          }
        },
        lab: {
          select: { name: true }
        }
      }
    });

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    // 🧠 Group by category (for accordion UI)
    const grouped = {};

    pkg.items.forEach(i => {
      const cat = i.test.category?.name || "Other";

      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(i.test.name);
    });

    const sections = Object.keys(grouped).map(title => ({
      title,
      tests: grouped[title]
    }));

    const tests = pkg.items.map(i => i.test);

    const originalPrice = tests.reduce((s, t) => s + (t.price || 0), 0);
    const finalPrice = pkg.finalPrice;

    res.json({
      packageId: pkg.id,
      packageName: pkg.name,
      labId: pkg.labId,
      labName: pkg.lab.name,
      imageUrl: pkg.imageUrl || null,

      testsCount: tests.length,
      reportTime: pkg.reportTime || "10 Hrs",

      sections,

      instructions: pkg.instructions
        ? pkg.instructions.split("\n")
        : [
          "Requires 10–12 hours fasting",
          "Only water allowed",
          "Avoid alcohol 24 hours before test"
        ],

      pricing: {
        mrp: originalPrice,
        finalPrice,
        discountPercent:
          originalPrice > 0
            ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
            : 0,
        currency: "INR"
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPackagesByAge = async (req, res) => {
  try {
    const age = Number(req.query.age);
    const labId = req.query.labId ? Number(req.query.labId) : null;
    const gender = req.query.gender?.toUpperCase();

    if (!age) {
      return res.status(400).json({
        message: "age is required",
      });
    }

    const packages = await prisma.labPackage.findMany({
      where: {
        ...(labId && { labId }), // ✅ only apply if present

        // AGE FILTER
        AND: [
          {
            OR: [{ minage: null }, { minage: { lte: age } }],
          },
          {
            OR: [{ maxage: null }, { maxage: { gte: age } }],
          },
        ],

        // GENDER FILTER (optional)
        ...(gender && {
          OR: [{ gender: "ALL" }, { gender }],
        }),
      },
      include: {
        lab: { select: { id: true, name: true } }, // ✅ show lab info
        items: {
          include: {
            test: { select: { name: true } },
          },
        },
      },
      orderBy: { finalPrice: "asc" },
    });

    res.json({
      age,
      labFilterApplied: !!labId,
      count: packages.length,
      packages: packages.map(p => ({
        packageId: p.id,
        packageName: p.name,
        labId: p.lab.id,
        labName: p.lab.name,
        finalPrice: p.finalPrice,
        reportTime: p.reportTime,
        gender: p.gender,
        minAge: p.minage,
        maxAge: p.maxage,
        tests: p.items.map(i => i.test.name),
        testsCount: p.items.length,
      })),
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
      userId,
      status: { in: ["COMPLETED", "CANCELLED"] },
    },
    include: {
      lab: true,
      package: {
        include: {
          items: {
            include: { test: true },
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
      : [],
    date: b.createdAt.toISOString().split("T")[0],
  }));

  res.json({ count: formatted.length, bookings: formatted });
};

export const getUserUpcomingLabBookings = async (req, res) => {
  const userId = Number(req.query.userId);

  if (!userId) {
    return res.status(400).json({ message: "userId required" });
  }

  const bookings = await prisma.labBooking.findMany({
    where: {
      userId,
      status: { in: ["HOLD", "CONFIRMED"] }
    },
    include: {
      lab: true,
      package: {
        include: {
          items: {
            include: { test: true }
          }
        }
      }
    },
    orderBy: { sampleDate: "asc" }
  });

  const formatted = bookings.map(b => ({
    bookingId: b.id,
    labName: b.lab?.name,

    // ✅ FIXED DATE FORMAT
    sampleDate: b.sampleDate
      ? new Date(b.sampleDate).toISOString().split("T")[0]
      : null,

    tests: b.package
      ? b.package.items.map(i => i.test.name)
      : []
  }));

  res.json({
    count: formatted.length,
    bookings: formatted
  });
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

        // ✅ AGE ADDED
        minAge: p.minage,
        maxAge: p.maxage,

        // Optional UI friendly
        ageRange:
          p.minage && p.maxage
            ? `${p.minage}-${p.maxage}`
            : "All Ages",

        gender: p.gender,

        tests: p.items.map(item => item.test.name),
        testsCount: p.items.length
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

    const filters = [];

    // 💰 Price
    if (minPrice || maxPrice) {
      filters.push({
        finalPrice: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) })
        }
      });
    }

    // 👶 Age overlap logic
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

    // 🚻 Gender
    if (gender) {
      const g = gender.toUpperCase();
      filters.push({
        OR: [{ gender: "ALL" }, { gender: g }]
      });
    }

    // 🔄 Sorting
    const orderBy =
      sortBy === "price_high"
        ? { finalPrice: "desc" }
        : { finalPrice: "asc" };

    const packages = await prisma.labPackage.findMany({
      where: { labId: Number(labId), AND: filters },
      include: {
        items: {
          include: { test: { select: { name: true } } }
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
        tests: p.items.map(i => i.test.name),
        testsCount: p.items.length,
        gender: p.gender,
        minAge: p.minage,
        maxAge: p.maxage
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const confirmLabBooking = async (req, res) => {
  try {

    const { userId, slotId } = req.body;

    const result = await prisma.$transaction(async (tx) => {

      const slot = await tx.labSlot.findUnique({
        where: { id: Number(slotId) },
        include: { bookings: true }
      });

      if (!slot) {
        throw new Error("Slot not found");
      }

      const now = new Date();

      const activeBooking = slot.bookings.find(b =>
        ["CONFIRMED", "SAMPLE_COLLECTED", "COMPLETED"].includes(b.status) ||
        (b.status === "HOLD" && b.expiresAt > now)
      );

      if (activeBooking) {
        throw new Error("Slot already booked");
      }

      const booking = await tx.labBooking.create({
        data: {
          userId,
          labId: slot.labId,
          slotId: slot.id,
          sampleDate: slot.slotDate,
          status: "CONFIRMED"
        }
      });

      return booking;
    });

    res.json({
      message: "Booking confirmed",
      bookingId: result.id
    });

  } catch (err) {

    if (err.message === "Slot already booked") {
      return res.status(409).json({
        message: "Slot already booked by another user"
      });
    }

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

export const getLabBookingById = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);

    const booking = await prisma.labBooking.findUnique({
      where: { id: bookingId },
      include: {
        lab: true,
        slot: true,
        patient: true,
        user: true   // ⭐ needed for self name
      }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    /* ---------- SAFE FORMATTERS ---------- */

    const safeDate = (d) =>
      d ? new Date(d).toLocaleDateString("en-IN") : null;

    const safeTime = (t) => {
      if (!t) return null;

      let dateObj;

      // Case 1: Already Date object
      if (t instanceof Date) {
        dateObj = t;
      }
      // Case 2: Full ISO string
      else if (String(t).includes("T")) {
        dateObj = new Date(t);
      }
      // Case 3: HH:mm:ss
      else {
        dateObj = new Date(`1970-01-01T${t}`);
      }

      if (isNaN(dateObj)) return null;

      return dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    };

    const start = booking.slot ? safeTime(booking.slot.startTime) : null;
    const end = booking.slot ? safeTime(booking.slot.endTime) : null;

    /* ---------- PATIENT NAME LOGIC ---------- */

    let patientName = null;

    // 1️⃣ Family member
    if (booking.patient && !booking.patient.isSelf) {
      patientName = booking.patient.fullName;
    }

    // 2️⃣ Self booking → use USER NAME
    if (!patientName && booking.user?.fullName) {
      patientName = booking.user.fullName;
    }

    // 3️⃣ Final fallback
    if (!patientName) {
      patientName = "Guest";
    }

    /* ---------- RESPONSE ---------- */

    return res.json({
      message: "Booking Details",
      booking: {
        bookingId: booking.id,
        labName: booking.lab?.name,

        slot: {
          date: booking.slot ? safeDate(booking.slot.slotDate) : null,
          time: start && end ? `${start} - ${end}` : null
        },

        patient: {
          name: patientName
        },

        status: booking.status
      }
    });

  } catch (err) {
    console.error("Lab booking error:", err);
    return res.status(500).json({ message: "Server error" });
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

export const getLabInvoice = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);

    const booking = await prisma.labBooking.findUnique({
      where: { id: bookingId },
      include: {
        lab: true,
        package: true,
        patient: true,
        user: true,
        slot: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const formatDate = (d) =>
      new Date(d).toLocaleDateString("en-IN");

    const formatTime = (t) =>
      new Date(t).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

    const start = formatTime(booking.slot.startTime);
    const end = formatTime(booking.slot.endTime);

    const patientName =
      booking.patient?.fullName ||
      booking.user?.fullName ||
      "Self";

    res.json({
      message: "Invoice generated",
      invoice: {
        invoiceId: `LAB-${booking.id}`,
        bookingId: booking.id,
        status: booking.status,

        lab: {
          name: booking.lab.name,
          address: booking.lab.address || booking.lab.city,
          phone: booking.lab.phone
        },

        patient: {
          name: patientName,
          age: booking.patient?.age,
          gender: booking.patient?.gender
        },

        test: {
          packageName: booking.package?.name,
          price: booking.package?.finalPrice
        },

        slot: {
          date: formatDate(booking.sampleDate),
          time: `${start} - ${end}`
        },

        payment: {
          subtotal: booking.package?.finalPrice || 0,
          discount: 0,
          tax: 0,
          total: booking.package?.finalPrice || 0,
          paid: true,
          paymentMode: "CASH" // or ONLINE later
        },

        generatedAt: new Date()
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const cancelLabBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const userId = Number(req.query.userId); // or req.user.id (recommended)

    if (!bookingId || !userId) {
      return res.status(400).json({
        message: "bookingId and userId required"
      });
    }

    const booking = await prisma.labBooking.findFirst({
      where: { id: bookingId, userId },
      include: { lab: true }
    });

    if (!booking) {
      return res.status(404).json({
        message: "Lab booking not found"
      });
    }

    // ❌ Already cancelled
    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "Booking already cancelled"
      });
    }

    // ❌ Completed cannot cancel
    if (booking.status === "COMPLETED") {
      return res.status(400).json({
        message: "Completed booking cannot be cancelled"
      });
    }

    // ❌ Sample collected cannot cancel
    if (booking.status === "SAMPLE_COLLECTED") {
      return res.status(400).json({
        message: "Sample already collected, cannot cancel"
      });
    }

    // ✅ Cancel booking
    await prisma.labBooking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" }
    });

    res.json({
      message: "Lab booking cancelled successfully",
      bookingId: booking.id,
      labName: booking.lab?.name,
      status: "CANCELLED"
    });

  } catch (error) {
    console.error("cancelLabBooking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getUserCancelledLabBookings = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const bookings = await prisma.labBooking.findMany({
      where: {
        userId,
        status: "CANCELLED",
      },
      include: {
        lab: true,
        package: {
          include: {
            items: {
              include: { test: true },
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
      cancelledOn: b.createdAt,
      tests: b.package
        ? b.package.items.map(i => i.test.name)
        : [],
    }));

    res.json({
      count: formatted.length,
      bookings: formatted,
    });
  } catch (error) {
    console.error("getUserCancelledLabBookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
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
  try {
    const userId = Number(req.query.userId);
    const search = req.query.search?.toLowerCase();
    const reportStatus = req.query.reportStatus;
    const timeRange = req.query.timeRange;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    // 📅 Date filter
    let dateFilter = {};

    if (fromDate || toDate) {
      dateFilter = {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && {
          lte: new Date(
            new Date(toDate).setHours(23, 59, 59, 999)
          )
        })
      };
    }

    // ✅ MAIN QUERY
    const reports = await prisma.labReport.findMany({
      where: {
        ...(reportStatus && { reportStatus }), // ✅ STATUS FILTER
        ...(Object.keys(dateFilter).length && {
          createdAt: dateFilter
        }),
        booking: {
          userId,
          status: "COMPLETED"
        }
      },
      include: {
        booking: {
          include: {
            lab: true,
            package: {
              include: {
                items: { include: { test: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 🔎 SEARCH FILTER (applied AFTER prisma)
    let filtered = reports;
    if (search) {
      filtered = reports.filter(r => {
        const lab = r.booking.lab?.name?.toLowerCase() || "";
        const pkg = r.booking.package?.name?.toLowerCase() || "";
        const tests = r.booking.package?.items
          ?.map(i => i.test.name.toLowerCase())
          .join(" ");

        return lab.includes(search) || pkg.includes(search) || tests.includes(search);
      });
    }

    // ✅ FORMAT RESPONSE
    const formatted = filtered.map(r => {
      const tests = r.booking.package?.items?.map(i => i.test.name) || [];

      return {
        reportId: r.id,
        labName: r.booking.lab?.name,
        testName: r.booking.package?.name || tests[0],
        testsCount: tests.length,
        status: r.reportStatus, // ✅ REAL STATUS
        date: r.createdAt.toISOString().split("T")[0]
      };
    });

    res.json({
      count: formatted.length,
      reports: formatted
    });

  } catch (err) {
    console.error("getUserLabReports:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getLabReportDetails = async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);

    const report = await prisma.labReport.findUnique({
      where: { id: reportId },
      include: {
        booking: {
          include: {
            lab: true,
            package: {
              include: {
                items: { include: { test: true } }
              }
            }
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const tests =
      report.booking.package?.items?.map(i => i.test.name) || [];

    // ✅ ADD TEST NAME
    const testName =
      report.booking.package?.name || tests[0] || "Lab Test";

    res.json({
      reportId: report.id,
      bookingId: report.labBookingId,

      // ✅ NEW FIELD
      testName,

      labName: report.booking.lab?.name,
      tests,
      collectedDate:
        report.collectedAt || report.booking.sampleDate,

      // ✅ use createdAt instead of issuedAt
      issuedDate: report.createdAt.toISOString().split("T")[0],

      resultSummary: report.summary || "No summary available",
      status: report.reportStatus,
      reports: report.reportUrls.map((url, i) => ({
        name: `Report-${i + 1}`,
        url
      }))
    });

  } catch (err) {
    console.error("getLabReportDetails:", err);
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
export const downloadLabReport = async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);

    const report = await prisma.labReport.findUnique({
      where: { id: reportId },
      select: { reportUrls: true }
    });

    if (!report?.reportUrls?.length) {
      return res.status(404).json({ message: "File not found" });
    }

    res.setHeader("Content-Disposition", "attachment");
    return res.redirect(report.reportUrls[0]);

  } catch (err) {
    console.error("downloadLabReport:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const submitLabFeedback = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({
        message: "bookingId and rating required"
      });
    }

    // 1️⃣ Check if feedback already exists
    const existing = await prisma.labFeedback.findUnique({
      where: { bookingId: Number(bookingId) }
    });

    if (existing) {
      return res.status(409).json({
        message: "Feedback already submitted"
      });
    }

    // 2️⃣ Save feedback
    const feedback = await prisma.labFeedback.create({
      data: {
        bookingId: Number(bookingId),
        rating,
        comment
      }
    });

    res.json({
      message: "Thank you for your feedback",
      feedback
    });

  } catch (err) {
    console.error("submitLabFeedback:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const checkFeedbackStatus = async (req, res) => {
  const bookingId = Number(req.params.bookingId);

  const feedback = await prisma.labFeedback.findUnique({
    where: { bookingId }
  });

  res.json({
    hasFeedback: !!feedback,
    feedback
  });
};

export const rescheduleLabBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const userId = Number(req.query.userId);
    const { newSlotId } = req.body;

    if (!bookingId || !userId || !newSlotId) {
      return res.status(400).json({
        message: "bookingId, userId and newSlotId required"
      });
    }

    const booking = await prisma.labBooking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        lab: true,
        slot: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (
      ["COMPLETED", "CANCELLED", "SAMPLE_COLLECTED"].includes(
        booking.status
      )
    ) {
      return res.status(400).json({
        message: "This booking cannot be rescheduled"
      });
    }

    const slot = await prisma.labSlot.findUnique({
      where: { id: Number(newSlotId) },
      include: { bookings: true }
    });

    if (!slot) {
      return res.status(404).json({
        message: "Slot not found"
      });
    }

    const now = new Date();

    // 🔒 Check if slot already booked
    const activeBooking = slot.bookings.find(b =>
      ["CONFIRMED", "SAMPLE_COLLECTED", "COMPLETED"].includes(b.status) ||
      (b.status === "HOLD" && b.expiresAt > now)
    );

    if (activeBooking) {
      return res.status(409).json({
        message: "Selected slot already booked"
      });
    }

    // ✅ Safe update
    const updatedBooking = await prisma.labBooking.update({
      where: { id: bookingId },
      data: {
        slotId: slot.id,
        sampleDate: slot.slotDate
      }
    });

    res.json({
      message: "Booking rescheduled successfully",
      bookingId: updatedBooking.id,
      labName: booking.lab?.name,
      newSlot: {
        slotId: slot.id,
        date: slot.slotDate.toISOString().split("T")[0]
      }
    });

  } catch (error) {
    console.error("rescheduleLabBooking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const rebookLabBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const { userId, slotId } = req.body;

    if (!bookingId || !userId || !slotId) {
      return res.status(400).json({
        message: "bookingId, userId and slotId required"
      });
    }

    const oldBooking = await prisma.labBooking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        lab: true,
        package: true,
        patient: true
      }
    });

    if (!oldBooking) {
      return res.status(404).json({
        message: "Previous booking not found"
      });
    }

    const slot = await prisma.labSlot.findUnique({
      where: { id: Number(slotId) }
    });

    if (!slot) {
      return res.status(404).json({
        message: "Slot not found"
      });
    }

    const newBooking = await prisma.labBooking.create({
      data: {
        userId,
        labId: oldBooking.labId,
        packageId: oldBooking.packageId,
        patientProfileId: oldBooking.patientProfileId,
        slotId: slot.id,
        sampleDate: slot.slotDate,
        status: "CONFIRMED"
      }
    });

    res.json({
      message: "Rebooking successful",
      booking: {
        newBookingId: newBooking.id,
        previousBookingId: oldBooking.id,
        labName: oldBooking.lab?.name,
        packageName: oldBooking.package?.name,
        newSlotDate: slot.slotDate
      }
    });

  } catch (error) {
    console.error("rebookLabBooking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const addRecentView = async (req, res) => {
  try {
    const { userId, labId, packageId } = req.body;

    if (!userId || !labId || !packageId) {
      return res.status(400).json({
        message: "userId, labId, packageId required"
      });
    }

    await prisma.labRecentView.upsert({
      where: {
        userId_packageId: {
          userId,
          packageId
        }
      },
      update: {
        createdAt: new Date()
      },
      create: {
        userId,
        labId,
        packageId
      }
    });

    res.json({ message: "Recent view saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}; export const getRecentViews = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    const limit = Number(req.query.limit || 5);

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const views = await prisma.labRecentView.findMany({
      where: { userId },
      include: {
        lab: true,
        package: true
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    res.json({
      count: views.length,
      recent: views.map(v => ({
        packageId: v.package.id,
        packageName: v.package.name,
        price: v.package.finalPrice,
        labId: v.lab.id,
        labName: v.lab.name,
        viewedAt: v.createdAt.toISOString().split("T")[0]
      }))
    });

  } catch (err) {
    console.error(err);
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
        lab: true,
        package: true
      },
      orderBy: { createdAt: "desc" }
    });

    // 🧠 Remove duplicate packages
    const unique = [];
    const seen = new Set();

    for (const b of bookings) {
      if (!seen.has(b.packageId)) {
        seen.add(b.packageId);
        unique.push(b);
      }
      if (unique.length === limit) break;
    }

    res.json({
      count: unique.length,
      tests: unique.map(b => ({
        packageId: b.package.id,
        testName: b.package.name, // still call it testName for UI
        price: b.package.finalPrice,
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