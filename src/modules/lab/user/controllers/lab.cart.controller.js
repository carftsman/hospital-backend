import prisma from "../../../../prisma/client.js";


// =========================
// ADD TO CART
// =========================
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
        userId_labTestId: { userId, labTestId },
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
        test: true,
      },
    });

    res.json({
      message: "Added to cart",
      item,
    });

  } catch (error) {
    console.error("addToLabCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================
// GET CART (FULL UI DATA)
// =========================
export const getLabCart = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
      },
    });

    const profile = await prisma.patientProfile.findFirst({
      where: { userId, isSelf: true },
      select: {
        id: true,
        age: true,
        gender: true,
      },
    });

    const items = await prisma.labCart.findMany({
      where: { userId },
      include: {
        lab: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        test: {
          select: {
            id: true,
            name: true,
            price: true,
            reportTime: true,
          },
        },
        patient: true,
      },
      orderBy: { id: "desc" },
    });

    const totalMRP = items.reduce(
      (sum, item) => sum + item.test.price * item.quantity,
      0
    );

    const discount = 0;
    const bookingFee = 10;
    const platformFee = 30;
    const homeCollection = 50;

    const totalAmount =
      totalMRP - discount + bookingFee + platformFee + homeCollection;

    res.json({
      user: {
        ...user,
        age: profile?.age || null,
        gender: profile?.gender || null,
        patientProfileId: profile?.id || null,
      },
      lab: items.length ? items[0].lab : null,
      count: items.length,
      items,
      billSummary: {
        totalMRP,
        discount,
        bookingFee,
        platformFee,
        homeCollection,
        totalAmount,
      },
    });

  } catch (error) {
    console.error("getLabCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================
// REMOVE ITEM
// =========================
export const removeFromLabCart = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    await prisma.labCart.delete({ where: { id } });

    res.json({ message: "Removed from cart" });

  } catch (error) {
    console.error("removeFromLabCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================
// CLEAR CART
// =========================
export const clearLabCart = async (req, res) => {
  const userId = Number(req.query.userId);
  await prisma.labCart.deleteMany({ where: { userId } });
  res.json({ message: "Cart cleared" });
};

export const checkoutLabCart = async (req, res) => {
  try {
    const { userId, sampleDate } = req.body;

    if (!userId || !sampleDate) {
      return res.status(400).json({
        message: "userId and sampleDate are required",
      });
    }

    //Get cart items
    const cartItems = await prisma.labCart.findMany({
      where: { userId },
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Create bookings
    const bookings = await prisma.$transaction(
      cartItems.map(item =>
        prisma.labBooking.create({
          data: {
            userId,
            labId: item.labId,
            labTestId: item.labTestId,
            sampleDate: new Date(sampleDate),
          },
        })
      )
    );

    // Clear cart
    await prisma.labCart.deleteMany({ where: { userId } });

    res.json({
      message: "Checkout successful",
      bookings,
    });
  } catch (error) {
    console.error("Checkout error:", error);
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
