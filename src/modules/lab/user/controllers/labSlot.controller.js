import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const formatTime = (time) => {
  return new Date(time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

export const getLabAvailability = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    if (!labId) {
      return res.status(400).json({ message: "labId required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 13);
    endDate.setHours(23, 59, 59, 999);

    const slots = await prisma.labSlot.groupBy({
      by: ["slotDate"],
      where: {
        labId,
        slotDate: {
          gte: today,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    });

    const slotMap = new Map();
    slots.forEach(s => {
      const dateStr = s.slotDate.toISOString().slice(0, 10);
      slotMap.set(dateStr, s._count.id);
    });

    const days = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = d.toISOString().slice(0, 10);

      days.push({
        date: dateStr,
        label:
          i === 0
            ? "Today"
            : i === 1
            ? "Tomorrow"
            : d.toLocaleDateString("en-IN", { weekday: "short" }),
        slotsAvailable: slotMap.get(dateStr) || 0
      });
    }

    return res.json({ labId, days });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getLabSlots = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const { date } = req.query;

    if (!labId || !date) {
      return res.status(400).json({
        message: "labId and date required"
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const slots = await prisma.labSlot.findMany({
      where: {
        labId,
        slotDate: {
          gte: start,
          lte: end
        }
      },
      include: {
        bookings: {
          where: {
            OR: [
              { status: "COMPLETED" },
              {
                status: "HOLD",
                expiresAt: { gt: new Date() }
              }
            ]
          }
        }
      },
      orderBy: {
        startTime: "asc"
      }
    });

    const formattedSlots = slots.map(slot => ({
      slotId: slot.id,
      startTime: formatTime(slot.startTime),
      endTime: formatTime(slot.endTime),
      time: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
      isBooked: slot.bookings.length > 0
    }));

    return res.json({
      labId,
      date,
      count: formattedSlots.length,
      slots: formattedSlots
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// export const checkoutLabCart = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { slotId, labTestId } = req.body;

//     if (!slotId || !labTestId) {
//       return res.status(400).json({
//         message: "slotId and labTestId required"
//       });
//     }

//     const result = await prisma.$transaction(async (tx) => {

//       const slot = await tx.labSlot.findUnique({
//         where: { id: slotId }
//       });

//       if (!slot) {
//         throw new Error("Slot not found");
//       }

//       const existingBooking = await tx.labBooking.findFirst({
//         where: {
//           slotId,
//           OR: [
//             { status: "COMPLETED" },
//             {
//               status: "HOLD",
//               expiresAt: { gt: new Date() }
//             }
//           ]
//         }
//       });

//       if (existingBooking) {
//         throw new Error("Slot already booked");
//       }

//       const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//       const booking = await tx.labBooking.create({
//         data: {
//           userId,
//           labId: slot.labId,
//           labTestId,
//           slotId,
//           sampleDate: slot.slotDate,
//           status: "HOLD",
//           expiresAt
//         }
//       });

//       return booking;
//     });

//     return res.status(200).json({
//       message: "Slot held for 10 minutes",
//       bookingId: result.id,
//       expiresAt: result.expiresAt
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(409).json({
//       message: err.message
//     });
//   }
// };

// export const confirmLabBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.body;

//     if (!bookingId) {
//       return res.status(400).json({ message: "bookingId required" });
//     }

//     const booking = await prisma.labBooking.findUnique({
//       where: { id: bookingId }
//     });

//     if (!booking || booking.status !== "HOLD") {
//       return res.status(404).json({ message: "Invalid booking" });
//     }

//     if (booking.expiresAt < new Date()) {
//       await prisma.labBooking.update({
//         where: { id: bookingId },
//         data: { status: "EXPIRED" }
//       });

//       return res.status(409).json({
//         message: "Booking expired"
//       });
//     }

//     await prisma.labBooking.update({
//       where: { id: bookingId },
//       data: { status: "COMPLETED" }
//     });

//     return res.json({
//       message: "Booking confirmed successfully"
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// /* =====================================================
//    5️⃣ BOOKING SUCCESS DETAILS
// ===================================================== */
// export const getLabBookingSuccess = async (req, res) => {
//   try {
//     const bookingId = Number(req.params.bookingId);

//     if (!bookingId) {
//       return res.status(400).json({ message: "bookingId required" });
//     }

//     const booking = await prisma.labBooking.findUnique({
//       where: { id: bookingId },
//       include: {
//         lab: true,
//         test: true,
//         slot: true
//       }
//     });

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     return res.json({
//       bookingId: booking.id,
//       labName: booking.lab?.name,
//       testName: booking.test?.name,
//       sampleDate: booking.sampleDate,
//       slotTime: booking.slot
//         ? `${formatTime(booking.slot.startTime)} - ${formatTime(booking.slot.endTime)}`
//         : null,
//       status: booking.status
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };
