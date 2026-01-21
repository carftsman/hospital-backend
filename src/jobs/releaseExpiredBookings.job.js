// // src/jobs/releaseExpiredBookings.job.js
// import prisma from "../prisma.js";

// export async function releaseExpiredBookings() {
//   try {
//     await prisma.$transaction(async (tx) => {
//       const expired = await tx.booking.findMany({
//         where: {
//           status: "EXPIRED",
//         },
//       });

//       for (const b of expired) {
//         await tx.timeSlot.update({
//           where: { id: b.timeslotId },
//           data: { isActive: true },
//         });
//       }
//     });
//   } catch (err) {
//     console.error("Release booking job error:", err);
//   }
// }
// src/jobs/releaseExpiredBookings.job.js
import prisma from "../prisma.js";

export async function releaseExpiredBookings() {
  try {
    //  Find EXPIRED bookings whose slots are still locked
    const expired = await prisma.booking.findMany({
      where: {
        status: "EXPIRED",
      },
      select: {
        id: true,
        timeslotId: true,
      },
    });

    if (expired.length === 0) return;

    const timeslotIds = expired.map(b => b.timeslotId);

    // 2️⃣ Release timeslots in bulk
    await prisma.timeSlot.updateMany({
      where: {
        id: { in: timeslotIds },
        isActive: false,
      },
      data: {
        isActive: true,
      },
    });

    console.log(`Released ${timeslotIds.length} expired timeslots`);
  } catch (err) {
    console.error("Release booking job error:", err.message);
  }
}
