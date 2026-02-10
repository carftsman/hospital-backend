import prisma from "../prisma/client.js";

export async function releaseExpiredBookings() {
  try {
    const cancelled = await prisma.booking.findMany({
      where: {
        status: "CANCELLED", // ✅ VALID ENUM
      },
      select: {
  id: true,
  timeSlotId: true
},
    });

    if (cancelled.length === 0) return;

    await prisma.timeSlot.updateMany({
      where: {
        id: { in: cancelled.map(b => b.timeslotId) },
        isActive: false,
      },
      data: {
        isActive: true,
      },
    });

    console.log(`Released ${cancelled.length} cancelled slots`);
  } catch (err) {
    console.error("Release booking job error:", err.message);
  }
}
