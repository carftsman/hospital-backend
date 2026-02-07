import prisma from "../../../../prisma/client.js";

export const addToLabCart = async (req, res) => {
  const { userId, labId, labTestId } = req.body;

  if (!userId || !labId || !labTestId) {
    return res.status(400).json({ message: "Missing required fields" });
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
  });

  res.json({
    message: "Added to cart",
    item,
  });
};
export const getLabCart = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

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
        labTest: {
          select: {
            id: true,
            name: true,
            price: true,
            reportTime: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + item.labTest.price * item.quantity,
      0
    );

    res.json({
      count: items.length,
      totalAmount,
      items,
    });
  } catch (error) {
    console.error("getLabCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromLabCart = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const existingItem = await prisma.labCart.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return res.status(404).json({
        message: "Cart item already removed or not found",
      });
    }

    await prisma.labCart.delete({
      where: { id },
    });

    res.json({ message: "Removed from cart" });
  } catch (error) {
    console.error("removeFromLabCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearLabCart = async (req, res) => {
  const userId = Number(req.query.userId);
  await prisma.labCart.deleteMany({ where: { userId } });
  res.json({ message: "Cart cleared" });
};
export const checkoutLabCart = async (req, res) => {
  const { userId, sampleDate } = req.body;

  const cartItems = await prisma.labCart.findMany({
    where: { userId },
  });

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

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

  await prisma.labCart.deleteMany({ where: { userId } });

  res.json({
    message: "Checkout successful",
    bookings,
  });
};