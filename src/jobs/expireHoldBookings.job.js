// // src/jobs/expireHoldBookings.job.js
// import prisma from "../prisma.js";

// export async function expireHoldBookings() {
//   try {
//     await prisma.$transaction(async (tx) => {
//       const expired = await tx.booking.findMany({
//         where: {
//           status: "HOLD",
//           expiresAt: { lt: new Date() },
//         },
//       });

//       for (const b of expired) {
//         await tx.booking.update({
//           where: { id: b.id },
//           data: { status: "EXPIRED" },
//         });

//         await tx.timeSlot.update({
//           where: { id: b.timeslotId },
//           data: { isActive: true },
//         });
//       }
//     });
//   } catch (err) {
//     console.error("Expire booking job failed:", err);
//   }
// }
// src/jobs/expireHoldBookings.job.js
import prisma from "../prisma.js";

export async function expireHoldBookings() {
  try {
    //  Find expired HOLD bookings (lightweight select)
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "HOLD",
        expiresAt: { lt: new Date() },
      },
      select: {
        id: true,
        timeslotId: true,
      },
    });

    if (expiredBookings.length === 0) return;

    const bookingIds = expiredBookings.map(b => b.id);
    const timeslotIds = expiredBookings.map(b => b.timeslotId);

    //  Expire bookings in bulk
    await prisma.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: { status: "EXPIRED" },
    });

    // Release timeslots in bulk
    await prisma.timeSlot.updateMany({
      where: { id: { in: timeslotIds } },
      data: { isActive: true },
    });

    console.log(`Expired ${bookingIds.length} bookings`);
  } catch (err) {
    console.error("Expire booking job failed:", err.message);
  }
}
