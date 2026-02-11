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


/**
 * SET DEFAULT ADDRESS
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const address = await prisma.labAddress.findUnique({ where: { id } });

    await prisma.labAddress.updateMany({
      where: { userId: address.userId },
      data: { isDefault: false }
    });

    await prisma.labAddress.update({
      where: { id },
      data: { isDefault: true }
    });

    res.json({ message: "Default address updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
