// src/jobs/releaseExpiredBookings.job.js
import prisma from "../prisma.js";

export async function releaseExpiredBookings() {
  try {
    await prisma.$transaction(async (tx) => {
      const expired = await tx.booking.findMany({
        where: {
          status: "EXPIRED",
        },
      });

      for (const b of expired) {
        await tx.timeSlot.update({
          where: { id: b.timeslotId },
          data: { isActive: true },
        });
      }
    });
  } catch (err) {
    console.error("Release booking job error:", err);
  }
}
