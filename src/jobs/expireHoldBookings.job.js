// src/jobs/expireHoldBookings.job.js
import prisma from "../prisma/client.js";

export const expireHoldBookings = async () => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: "HOLD" }
    });

    if (!bookings.length) return;

    const slotIds = bookings
  .map(b => b.slotId)
  .filter(Boolean); // removes undefined/null

if (slotIds.length > 0) {
  await prisma.timeSlot.updateMany({
    where: {
      id: { in: slotIds },
      isActive: false
    },
    data: { isActive: true }
  });
}

    console.log("Expired bookings cleaned");
  } catch (err) {
    console.error("❌ Expire booking job failed:", err.message);
  }
};