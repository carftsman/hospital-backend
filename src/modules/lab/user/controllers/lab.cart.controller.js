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

    const existing = await prisma.labCart.findFirst({
      where: { userId, packageId },
    });

    let item;

    if (existing) {
      item = await prisma.labCart.update({
        where: { id: existing.id },
        data: { quantity: { increment: 1 } },
        include: {
          package: {
            include: {
              items: { include: { test: { select: { name: true } } } },
            },
          },
        },
      });
    } else {
      item = await prisma.labCart.create({
        data: { userId, labId, packageId },
        include: {
          package: {
            include: {
              items: { include: { test: { select: { name: true } } } },
            },
          },
        },
      });
    }

    res.json({
      message: "Package added to cart",
      item,
    });
  } catch (error) {
    console.error("addToLabCart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabCart = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ message: "userId required" });

    const items = await prisma.labCart.findMany({
      where: { userId },
      include: {
        lab: true,
        package: {
          include: {
            items: { include: { test: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    const valid = items.filter(i => i.package);

    const totalMRP = valid.reduce(
      (sum, i) => sum + i.package.finalPrice * i.quantity,
      0
    );

    const bookingFee = 10;
    const platformFee = 30;
    const homeCollection = 50;

    res.json({
      lab: valid[0]?.lab || null,
      count: valid.length,
      items: valid.map(i => ({
        id: i.id,
        name: i.package.name,
        price: i.package.finalPrice,
        quantity: i.quantity,
        tests: i.package.items.map(t => t.test.name),
      })),
      billSummary: {
        totalMRP,
        bookingFee,
        platformFee,
        homeCollection,
        totalAmount: totalMRP + bookingFee + platformFee + homeCollection,
      },
    });
  } catch (error) {
    console.error("getLabCart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * REMOVE CART ITEM
 */
export const removeFromLabCart = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.labCart.delete({ where: { id } });
  res.json({ message: "Removed from cart" });
};

/**
 * CLEAR CART
 */
export const clearLabCart = async (req, res) => {
  const userId = Number(req.query.userId);
  await prisma.labCart.deleteMany({ where: { userId } });
  res.json({ message: "Cart cleared" });
};

export const checkoutLabCart = async (req, res) => {
  try {
    const { userId, slotId, patientProfileId } = req.body;

    if (!userId || !slotId)
      return res.status(400).json({ message: "userId and slotId required" });

    const result = await prisma.$transaction(async tx => {
      const slot = await tx.labSlot.findUnique({
        where: { id: Number(slotId) },
      });
      if (!slot) throw new Error("Slot not found");

      const cart = await tx.labCart.findMany({ where: { userId } });
      if (!cart.length) throw new Error("Cart empty");

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const bookings = [];

      for (const item of cart) {
        const booking = await tx.labBooking.create({
  data: {
    userId: Number(userId),
    labId: Number(item.labId),
    packageId: Number(item.packageId), // ✅ package booking
    slotId: Number(slotId),
    sampleDate: slot.slotDate,
    status: "HOLD",
    expiresAt,
    patientProfileId: patientProfileId || null,
  },
});

        bookings.push(booking);
      }

      await tx.labCart.deleteMany({ where: { userId } });

      return bookings;
    });

    res.json({
      message: "Slot held",
      bookingIds: result.map(b => b.id),
      expiresAt: result[0]?.expiresAt,
    });
  } catch (err) {
    console.error("checkout error:", err);
    res.status(500).json({ message: err.message });
  }
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