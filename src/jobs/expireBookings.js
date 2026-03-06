import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const releaseExpiredSlots = async () => {
  try {

    const result = await prisma.booking.updateMany({
      where: {
        status: "HOLD",
        expiresAt: { lt: new Date() }
      },
      data: {
        status: "EXPIRED"
      }
    });

    console.log("Expired bookings cleaned");
    console.log(`Released ${result.count} expired slots`);

  } catch (error) {

    console.error("releaseExpiredSlots error:", error);

  }
};