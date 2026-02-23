import prisma from "../prisma/client.js";

export async function releaseExpiredBookings() {
  try {
    const cancelled = await prisma.booking.findMany({
      where: {
        status: "CANCELLED"
      },
      select: {
        id: true,
        timeSlotId: true
      }
    });

    if (!cancelled.length) return;

    // ✅ FIX: correct casing + safe filter
    const slotIds = cancelled
      .map(b => b.timeSlotId)
      .filter(id => typeof id === "number");

    if (slotIds.length === 0) return;

    await prisma.timeSlot.updateMany({
      where: {
        id: { in: slotIds },
        isActive: false
      },
      data: {
        isActive: true
      }
    });

    console.log(`✅ Released ${slotIds.length} cancelled slots`);
  } catch (err) {
    console.error("Release booking job error:", err);
  }
}