import prisma from "../../../../prisma/client.js";

export const addToLabCart = async (req, res) => {
  try {
    const { userId, labId, packageId } = req.body;

    if (!userId || !labId || !packageId) {
      return res.status(400).json({
        message: "userId, labId and packageId required",
      });
    }

    // Single lab rule
    const existingCart = await prisma.labCart.findFirst({ where: { userId } });
    if (existingCart && existingCart.labId !== labId) {
      return res.status(409).json({
        message: "Cart contains items from another lab. Clear cart first."
      });
    }

    // Prevent duplicates
    let item = await prisma.labCart.findFirst({
      where: { userId, packageId },
      include: {
        package: {
          include: { items: { include: { test: true } } }
        }
      }
    });

    if (!item) {
      item = await prisma.labCart.create({
        data: { userId, labId, packageId },
        include: {
          package: {
            include: { items: { include: { test: true } } }
          }
        }
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, phone: true }
    });

    const tests = item.package.items.map(i => i.test.name);

    res.json({
      message: "Package added to cart",
      user,
      item: {
        id: item.id,
        labId: item.labId,
        packageId: item.packageId,
        name: item.package.name,
        price: item.package.finalPrice,
        quantity: item.quantity,
        testsCount: tests.length,
        tests
      }
    });

  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getLabCart = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    fullName: true,
    phone: true
  }
});

    const cart = await prisma.labCart.findMany({
      where: { userId },
      include: {
        lab: true,
        package: {
          include: { items: { include: { test: true } } }
        },
        patient: true
      }
    });

    if (!cart.length) {
      return res.json({
        user,
        items: [],
        billSummary: null
      });
    }

    const lab = cart[0]?.lab || null;
    const consultationType = cart[0]?.consultationType || "LAB_VISIT";

   const items = cart.map(i => {
  const pkg = i.package;

  const patient = i.patient || {
    fullName: user.fullName,
    age: null,
    gender: null,
    phone: user.phone,
    isSelf: true
  };

  return {
    id: i.id,
    packageId: i.packageId,
    name: pkg?.name,
    price: pkg?.finalPrice,
    testsCount: pkg?.items?.length || 0,
    tests: pkg?.items?.map(t => t.test.name) || [],
    patient // 👈 per package patient
  };
});

const totalMRP = items.reduce((sum, i) => sum + (i.price || 0), 0);
    const bookingFee = 10;
    const platformFee = 30;
    const homeCollection =
      consultationType === "SAMPLE_COLLECTION" ? 50 : 0;

    const totalAmount =
      totalMRP + bookingFee + platformFee + homeCollection;
const patientBill = {};

items.forEach(item => {
  const name = item.patient.fullName;

  if (!patientBill[name]) patientBill[name] = 0;
  patientBill[name] += item.price;
});
   res.json({
  user,
  consultationType,
  lab,
  items,

  patientBill, // ✅ ADD THIS

  billSummary: {
    totalMRP,
    bookingFee,
    platformFee,
    homeCollection,
    totalAmount
  }
});

  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
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
export const getCartSummary = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, phone: true }
    });

    const cart = await prisma.labCart.findMany({
      where: { userId },
      include: {
        lab: true,
        package: true,
        patient: true
      }
    });

    if (!cart.length) {
      return res.status(400).json({ message: "Cart empty" });
    }

    const lab = cart[0].lab;
    const consultationType = cart[0].consultationType;

    const address = await prisma.labAddress.findFirst({
      where: { userId, isDefault: true }
    });

    const packages = cart.map(c => ({
      cartId: c.id,
      packageId: c.packageId,
      name: c.package.name,
      price: c.package.finalPrice,
      patient: c.patient || {
        fullName: user.fullName,
        phone: user.phone,
        isSelf: true
      }
    }));

    const totalMRP = packages.reduce((s, p) => s + p.price, 0);

    const bookingFee = 10;
    const platformFee = 30;
    const homeCollection =
      consultationType === "SAMPLE_COLLECTION" ? 50 : 0;

    const totalAmount =
      totalMRP + bookingFee + platformFee + homeCollection;

    res.json({
      user,
      consultationType,
      address,
      lab,
      packages,
      billSummary: {
        totalMRP,
        bookingFee,
        platformFee,
        homeCollection,
        totalAmount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const addPatientToCartItem = async (req, res) => {
  try {
    const cartId = Number(req.params.cartId);
    const { fullName, age, gender, phone } = req.body;

    const cartItem = await prisma.labCart.findUnique({
      where: { id: cartId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const patient = await prisma.patientProfile.create({
      data: {
        userId: cartItem.userId,
        fullName,
        age,
        gender,
        phone
      }
    });

    await prisma.labCart.update({
      where: { id: cartId },
      data: { patientProfileId: patient.id }
    });

    res.json({
      message: "Patient added to package",
      patient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};