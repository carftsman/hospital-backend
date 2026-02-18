import prisma from "../../../../prisma/client.js";

/**
 * CREATE ADDRESS
 */
export const createAddress = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      mobile,
      house,
      street,
      landmark,
      city,
      state,
      pinCode
    } = req.body;

    if (!userId || !fullName || !mobile || !house || !street || !city || !state || !pinCode) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    // Auto default for first address
    const count = await prisma.labAddress.count({ where: { userId } });

    const address = await prisma.labAddress.create({
      data: {
        userId,
        fullName,
        mobile,
        house,
        street,
        landmark,
        city,
        state,
        pinCode,
        isDefault: count === 0
      }
    });

    res.json({
      message: count === 0
        ? "Address created and set as default"
        : "Address created successfully",
      address
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ADDRESSES
 */
export const getAddresses = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    const addresses = await prisma.labAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.json({
      defaultAddress: addresses.find(a => a.isDefault) || null,
      savedAddresses: addresses.filter(a => !a.isDefault),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * EDIT ADDRESS (NO UNAUTHORIZED NOW)
 */
export const editAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const address = await prisma.labAddress.findUnique({
      where: { id }
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const {
      fullName,
      mobile,
      house,
      street,
      landmark,
      city,
      state,
      pinCode
    } = req.body;

    const updated = await prisma.labAddress.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(mobile && { mobile }),
        ...(house && { house }),
        ...(street && { street }),
        ...(landmark && { landmark }),
        ...(city && { city }),
        ...(state && { state }),
        ...(pinCode && { pinCode }),
      }
    });

    res.json({
      message: "Address updated successfully",
      address: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE ADDRESS
 */
export const deleteAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const address = await prisma.labAddress.findUnique({
      where: { id }
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    const userId = address.userId;

    await prisma.labAddress.delete({ where: { id } });

    // Reassign default if needed
    if (wasDefault) {
      const next = await prisma.labAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" }
      });

      if (next) {
        await prisma.labAddress.update({
          where: { id: next.id },
          data: { isDefault: true }
        });
      }
    }

    res.json({ message: "Address deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * SET DEFAULT ADDRESS
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const address = await prisma.labAddress.findUnique({
      where: { id }
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const userId = address.userId;

    await prisma.$transaction([
      prisma.labAddress.updateMany({
        where: { userId },
        data: { isDefault: false }
      }),
      prisma.labAddress.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);

    res.json({ message: "Default address updated" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
