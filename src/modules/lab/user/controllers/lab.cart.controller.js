import prisma from "../../../../prisma/client.js";


export const addToLabCart = async (req, res) => {
  try {
    const { userId, labId, labTestId } = req.body;

    if (!userId || !labId || !labTestId) {
      return res.status(400).json({
        message: "userId, labId and labTestId are required",
      });
    }

    const item = await prisma.labCart.upsert({
      where: {
        userId_labId_labTestId: {
          userId,
          labId,
          labTestId,
        },
      },
      update: {
        quantity: { increment: 1 },
      },
      create: {
        userId,
        labId,
        labTestId,
      },
      include: {
        test: {
          select: { id: true, name: true, price: true },
        },
      },
    });

    res.json({
      message: "Added to cart",
      item: {
        id: item.id,
        labId: item.labId,
        labTestId: item.labTestId,   // ✅ added
        name: item.test.name,
        price: item.test.price,
        quantity: item.quantity,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getLabCart = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, phone: true },
    });

    const profile = await prisma.patientProfile.findFirst({
      where: { userId, isSelf: true },
      select: { age: true, gender: true },
    });

    const items = await prisma.labCart.findMany({
      where: { userId },
      include: {
        lab: { select: { id: true, name: true, city: true } },
        test: { select: { id: true, name: true, price: true } },
      },
      orderBy: { id: "desc" },
    });

    const totalMRP = items.reduce(
      (sum, i) => sum + i.test.price * i.quantity,
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
      lab: items.length ? items[0].lab : null,
      count: items.length,

      items: items.map(i => ({
        id: i.id,
        labId: i.labId,
        labTestId: i.labTestId,   // ✅ added
        name: i.test.name,
        price: i.test.price,
        quantity: i.quantity,
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
    console.error(error);
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
        test: true,
        user: true,
        patient: true
      }
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "Bookings not found" });
    }

    // 🔒 check expiry
    const expired = bookings.some(
      b => b.status !== "HOLD" || (b.expiresAt && new Date() > b.expiresAt)
    );

    if (expired) {
      return res.status(409).json({
        message: "Booking expired. Please reselect slot"
      });
    }

    const user = bookings[0].user;

    // Default address
    const address = await prisma.labAddress.findFirst({
      where: { userId: user.id, isDefault: true }
    });

    // Tests list
    const tests = bookings.map(b => ({
      id: b.test.id,
      name: b.test.name,
      price: b.test.price,
      reportTime: b.test.reportTime
    }));

    const lab = bookings[0].lab;

    const patient = bookings[0].patient
      ? {
          name: bookings[0].patient.fullName,
          age: bookings[0].patient.age,
          gender: bookings[0].patient.gender
        }
      : null;

    // 💰 Bill summary
    const totalMRP = tests.reduce((sum, t) => sum + t.price, 0);
    const discount = 0;
    const bookingFee = 10;
    const platformFee = 30;
    const homeCollection = 50;

    const totalAmount =
      totalMRP - discount + bookingFee + platformFee + homeCollection;

    return res.json({
      bookingIds: ids,
      expiresAt: bookings[0].expiresAt,

      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone
      },

      patient,
      lab,
      tests,
      address,

      billSummary: {
        totalMRP,
        discount,
        bookingFee,
        platformFee,
        homeCollection,
        totalAmount
      }
    });

  } catch (err) {
    console.error("getBookingSummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkoutLabCart = async (req, res) => {
  try {
    const { userId, slotId, patientProfileId } = req.body;

    if (!userId || !slotId) {
      return res.status(400).json({
        message: "userId and slotId are required"
      });
    }

    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Validate slot
      const slot = await tx.labSlot.findUnique({
        where: { id: Number(slotId) }
      });

      if (!slot) {
        throw new Error("Slot not found");
      }

      // 2️⃣ Check slot availability
      const existing = await tx.labBooking.findFirst({
        where: {
          slotId: Number(slotId),
          OR: [
            { status: "COMPLETED" },
            {
              status: "HOLD",
              expiresAt: { gt: new Date() }
            }
          ]
        }
      });

      if (existing) {
        throw new Error("Slot already booked");
      }

      // 3️⃣ Get cart items
      const cartItems = await tx.labCart.findMany({
        where: { userId: Number(userId) }
      });

      if (!cartItems.length) {
        throw new Error("Cart is empty");
      }

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const bookings = [];

      // 4️⃣ Create bookings
      for (const item of cartItems) {
        const booking = await tx.labBooking.create({
          data: {
            userId: Number(userId),
            labId: item.labId,
            labTestId: item.labTestId,
            slotId: Number(slotId),
            sampleDate: slot.slotDate,
            status: "HOLD",
            expiresAt,
            ...(patientProfileId && {
              patientProfileId: Number(patientProfileId)
            })
          }
        });

        bookings.push(booking);
      }

      // 5️⃣ Clear cart
      await tx.labCart.deleteMany({
        where: { userId: Number(userId) }
      });

      return bookings;
    });

    return res.status(200).json({
      message: "Slot held for 10 minutes",
      bookingCount: result.length,
      bookingIds: result.map(b => b.id),
      expiresAt: result[0].expiresAt
    });

  } catch (err) {
    console.error("checkoutLabCart error:", err);

    if (err.message === "Slot not found") {
      return res.status(404).json({ message: err.message });
    }

    if (
      err.message === "Slot already booked" ||
      err.message === "Cart is empty"
    ) {
      return res.status(409).json({ message: err.message });
    }

    return res.status(500).json({
      message: "Internal server error"
    });
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
