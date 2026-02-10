// src/jobs/expireHoldBookings.job.js
import prisma from "../prisma/client.js";

export async function expireHoldBookings() {
  try {
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "HOLD"
,
        expiresAt: { lt: new Date() }
      },
      select: {
        id: true,
        timeSlotId: true   // ✅ correct
      }
    });

    if (expiredBookings.length === 0) return;

    const bookingIds = expiredBookings.map(b => b.id);
    const timeSlotIds = expiredBookings.map(b => b.timeSlotId);

    // Mark bookings as EXPIRED
    await prisma.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: { status: "EXPIRED" }
    });

    // (Optional) deactivate slots if you want
    await prisma.timeSlot.updateMany({
      where: { id: { in: timeSlotIds } },
      data: { isActive: true }
    });

    console.log(`✅ Expired ${bookingIds.length} HOLD bookings`);
  } catch (err) {
    console.error("❌ Expire booking job failed:", err);
  }
}
