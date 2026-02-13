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
        pinCode
      }
    });

    res.json({
      message: "Address created successfully",
      address
    });

  } catch (error) {
    console.error("createAddress error:", error);
    res.status(500).json({ message: error.message });
  }
};


/**
 * GET USER ADDRESSES
 */
export const getAddresses = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    const addresses = await prisma.labAddress.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    res.json(addresses);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * DELETE ADDRESS
 */
export const deleteAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.labAddress.delete({
      where: { id }
    });

    res.json({ message: "Address deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const setDefaultAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.body.userId); // ✅ for Swagger testing

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const address = await prisma.labAddress.findUnique({
      where: { id }
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found"
      });
    }

    if (address.userId !== userId) {
      return res.status(403).json({
        message: "Unauthorized access"
      });
    }

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

    return res.json({
      message: "Default address updated"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
