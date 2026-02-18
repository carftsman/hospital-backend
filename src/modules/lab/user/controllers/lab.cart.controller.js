import prisma from "../../../../prisma/client.js";

/**
 * ADD PACKAGE TO CART
 */
export const addToLabCart = async (req, res) => {
  try {
    const { userId, labId, packageId } = req.body;

    if (!userId || !labId || !packageId) {
      return res.status(400).json({
        message: "userId, labId and packageId are required",
      });
    }

    const item = await prisma.labCart.upsert({
      where: {
        userId_packageId: { userId, packageId },
      },
      update: {
        quantity: { increment: 1 },
      },
      create: {
        userId,
        labId,
        packageId,
      },
      include: {
        package: {
          include: {
            items: {
              include: {
                test: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    res.json({
      message: "Package added to cart",
      item: {
        id: item.id,
        labId: item.labId,
        packageId: item.packageId,
        name: item.package.name,
        price: item.package.finalPrice,
        quantity: item.quantity,

        // ✅ NEW
        testsCount: item.package.items.length,
        tests: item.package.items.map(t => t.test.name),
      },
    });
  } catch (error) {
    console.error("addToLabCart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET PACKAGE CART
 */
export const getLabCart = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    // 👤 User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, phone: true },
    });

    // 🧍 Profile
    const profile = await prisma.patientProfile.findFirst({
      where: { userId, isSelf: true },
      select: { age: true, gender: true },
    });

    // 🛒 Cart
    const items = await prisma.labCart.findMany({
      where: { userId },
      include: {
        lab: { select: { id: true, name: true, city: true } },
        package: {
          include: {
            items: {
              include: {
                test: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    // ✅ REMOVE INVALID ROWS
    const validItems = items.filter(i => i.package);

    // 💰 BILLING
    const totalMRP = validItems.reduce(
      (sum, i) => sum + i.package.finalPrice * i.quantity,
      0
    );

    const discount = Math.round(totalMRP * 0.1);
    const bookingFee = 10;
    const platformFee = 30;
    const homeCollection = 50;

    const totalAmount =
      totalMRP - discount + bookingFee + platformFee + homeCollection;

    res.json({
      user: {
        id: user?.id,
        fullName: user?.fullName,
        phone: user?.phone,
        age: profile?.age || null,
        gender: profile?.gender || null,
      },

      lab: validItems.length ? validItems[0].lab : null,
      count: validItems.length,

      items: validItems.map(i => ({
        id: i.id,
        labId: i.labId,
        packageId: i.packageId,
        name: i.package.name,
        price: i.package.finalPrice,
        quantity: i.quantity,

        // ✅ TEST INFO
        testsCount: i.package.items.length,
        tests: i.package.items.map(t => t.test.name),
      })),

      billSummary: {
        totalMRP,
        discount,
        homeCollection,
        bookingFee,
        platformFee,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("getLabCart:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const removeFromLabCart = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await prisma.labCart.deleteMany({ where: { id } });

    if (!result.count) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearLabCart = async (req, res) => {
  const userId = Number(req.query.userId);
  await prisma.labCart.deleteMany({ where: { userId } });
  res.json({ message: "Cart cleared" });
};
export const getBookingSummary = async (req, res) => {
  try {
    const { bookingIds } = req.query;

    if (!bookingIds) {
      return res.status(400).json({ message: "bookingIds required" });
    }

    const ids = bookingIds.split(",").map(Number);

    const bookings = await prisma.labBooking.findMany({
      where: { id: { in: ids } },
      include: {
        lab: true,
        package: {
          include: {
            items: {
              include: {
                test: true,
              },
            },
          },
        },
        user: true,
        patient: true,
      },
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "Bookings not found" });
    }

    const expired = bookings.some(
      (b) => b.status !== "HOLD" || (b.expiresAt && new Date() > b.expiresAt)
    );

    if (expired) {
      return res.status(409).json({
        message: "Booking expired. Please reselect slot",
      });
    }

    const user = bookings[0].user;
    const lab = bookings[0].lab;

    const packages = bookings.map((b) => ({
      id: b.package?.id,
      name: b.package?.name,
      price: b.package?.finalPrice,
      tests: b.package?.items.map((i) => i.test.name),
    }));

    const totalMRP = packages.reduce((sum, p) => sum + (p.price || 0), 0);

    const bookingFee = 10;
    const platformFee = 30;
    const homeCollection = 50;

    const totalAmount =
      totalMRP + bookingFee + platformFee + homeCollection;

    return res.json({
      bookingIds: ids,
      expiresAt: bookings[0].expiresAt,
      user,
      lab,
      packages,
      billSummary: {
        totalMRP,
        bookingFee,
        platformFee,
        homeCollection,
        totalAmount,
      },
    });
  } catch (err) {
    console.error("summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkoutLabCart = async (req, res) => {
  try {
    const { userId, slotId, patientProfileId } = req.body;

    if (!userId || !slotId) {
      return res.status(400).json({
        message: "userId and slotId are required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Validate slot
      const slot = await tx.labSlot.findUnique({
        where: { id: Number(slotId) },
      });
      if (!slot) throw new Error("Slot not found");

      // 2️⃣ Get cart
      const cartItems = await tx.labCart.findMany({
        where: { userId: Number(userId) },
      });

      if (!cartItems.length) throw new Error("Cart is empty");

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const bookings = [];

      // 3️⃣ Create bookings (PACKAGE BASED)
      for (const item of cartItems) {
        const booking = await tx.labBooking.create({
          data: {
            userId: Number(userId),
            labId: item.labId,
            packageId: item.packageId, // ✅ PACKAGE
            slotId: Number(slotId),
            sampleDate: slot.slotDate,
            status: "HOLD",
            expiresAt,
            patientProfileId: item.patientProfileId || null,
          },
        });

        bookings.push(booking);
      }

      // 4️⃣ Clear cart
      await tx.labCart.deleteMany({
        where: { userId: Number(userId) },
      });

      return bookings;
    });

    return res.json({
      message: "Slot held for 10 minutes",
      bookingCount: result.length,
      bookingIds: result.map((b) => b.id),
      expiresAt: result[0]?.expiresAt,
    });
  } catch (err) {
    console.error("checkout error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};



export const addPatientAndAttachToCart = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      age,
      gender,
      phone,
      consultationType,
    } = req.body;

    if (!userId || !fullName || !consultationType) {
      return res.status(400).json({
        message: "userId, fullName and consultationType are required",
      });
    }

    // 1️⃣ Check cart exists
    const cartItems = await prisma.labCart.findMany({
      where: { userId },
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2️⃣ Create Patient Profile
    const patient = await prisma.patientProfile.create({
      data: {
        userId,
        fullName,
        age: age ? Number(age) : null,
        gender,
        phone,
      },
    });

    // 3️⃣ Attach patient + consultation to cart
    await prisma.labCart.updateMany({
      where: { userId },
      data: {
        patientProfileId: patient.id,
        consultationType,
      },
    });

    res.json({
      message: "Patient created and attached successfully",
      patient,
    });
  } catch (error) {
    console.error("addPatientAndAttachToCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
