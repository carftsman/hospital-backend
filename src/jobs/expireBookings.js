import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const releaseExpiredSlots = async () => {

  const expired = await prisma.booking.findMany({
    where: {
      status: "HOLD",
      expiresAt: { lt: new Date() }
    }
  });

  for (const b of expired) {

    await prisma.timeSlot.update({
      where: { id: b.timeSlotId },
      data: { isBooked: false }
    });

  }

  await prisma.booking.updateMany({
    where: {
      status: "HOLD",
      expiresAt: { lt: new Date() }
    },
    data: {
      status: "EXPIRED"
    }
  });

};