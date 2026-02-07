// src/jobs/expireHoldBookings.job.js
import prisma from "../prisma/client.js";

export async function expireHoldBookings() {
  try {
    // Find PENDING bookings that have passed expiresAt
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING", // VALID ENUM value
        expiresAt: { lt: new Date() },
      },
      select: { id: true, timeslotId: true },
    });

    if (expiredBookings.length === 0) {
      return;
    }

    const bookingIds = expiredBookings.map(b => b.id);
    const timeslotIds = expiredBookings.map(b => b.timeslotId);

    // Mark bookings as CANCELLED (valid enum), in bulk
    await prisma.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: { status: "CANCELLED" },
    });

    // Release related timeslots
    await prisma.timeSlot.updateMany({
      where: { id: { in: timeslotIds } },
      data: { isActive: true },
    });

    console.log(`✅ Expired ${bookingIds.length} bookings and released slots`);
  } catch (err) {
    console.error("❌ Expire booking job failed:", err?.message ?? err);
  }
}
