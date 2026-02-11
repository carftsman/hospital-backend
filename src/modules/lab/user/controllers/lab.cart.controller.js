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
  try {
    const userId = Number(req.query.userId);

    await prisma.labCart.deleteMany({ where: { userId } });

    res.json({ message: "Cart cleared" });

  } catch (error) {
    console.error("clearLabCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================
// CHECKOUT (FINAL PRODUCTION)
// =========================
export const checkoutLabCart = async (req, res) => {
  try {
    const { userId, patientProfileId, slotId, sampleDate } = req.body;

    if (!userId || !patientProfileId || !slotId || !sampleDate) {
      return res.status(400).json({
        message: "userId, patientProfileId, slotId and sampleDate required",
      });
    }

    const cartItems = await prisma.labCart.findMany({
      where: { userId },
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const slot = await prisma.labSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.isBooked) {
      return res.status(400).json({ message: "Slot unavailable" });
    }

    const result = await prisma.$transaction(async (tx) => {

      // Create bookings
      const bookings = [];

      for (const item of cartItems) {
        const booking = await tx.labBooking.create({
          data: {
            userId,
            labId: item.labId,
            labTestId: item.labTestId,
            sampleDate: new Date(sampleDate),
          },
        });

        bookings.push(booking);
      }

      // Mark slot booked
      await tx.labSlot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });

      // Clear cart
      await tx.labCart.deleteMany({
        where: { userId },
      });

      return bookings;
    });

    res.json({
      message: "Booking confirmed successfully",
      bookings: result,
    });

  } catch (error) {
    console.error("checkoutLabCart error:", error);
    res.status(500).json({ message: error.message });
  }
};
