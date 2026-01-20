// src/jobs/expireHoldBookings.job.js
import prisma from "../prisma.js";

export async function expireHoldBookings() {
  try {
    await prisma.$transaction(async (tx) => {
      const expired = await tx.booking.findMany({
        where: {
          status: "HOLD",
          expiresAt: { lt: new Date() },
        },
      });

      for (const b of expired) {
        await tx.booking.update({
          where: { id: b.id },
          data: { status: "EXPIRED" },
        });

        await tx.timeSlot.update({
          where: { id: b.timeslotId },
          data: { isActive: true },
        });
      }
    });
  } catch (err) {
    console.error("Expire booking job failed:", err);
  }
}
