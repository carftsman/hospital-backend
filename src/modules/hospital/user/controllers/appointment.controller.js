// src/modules/hospital/user/controllers/appointment.controller.js
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
//import razorpay from "../../../../config/razorpay.js";

const prisma = new PrismaClient();

/**
 * 1️⃣ Doctor availability for next 12 days (UI date tabs)
 */
// export const getDoctorAvailability = async (req, res) => {
//   const { doctorId } = req.query;
//   if (!doctorId) {
//     return res.status(400).json({ message: "doctorId required" });
//   }

//   const today = new Date();
//   const days = [];

//   for (let i = 0; i < 12; i++) {
//     const date = new Date(today);
//     date.setDate(today.getDate() + i);

//     const start = new Date(date);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(date);
//     end.setHours(23, 59, 59, 999);

//     const slotsCount = await prisma.timeSlot.count({
//       where: {
//         doctorId: Number(doctorId),
//         start: { gte: start, lte: end },
//         isActive: true,
//         booking: null,
//       },
//     });

//     days.push({
//       date: start.toISOString().slice(0, 10),
//       label:
//         i === 0
//           ? "Today"
//           : i === 1
//           ? "Tomorrow"
//           : start.toLocaleDateString("en-IN", {
//               weekday: "short",
//               month: "short",
//               day: "numeric",
//             }),
//       slotsAvailable: slotsCount,
//     });
//   }

//   res.json({ doctorId: Number(doctorId), days });
// };
export const getDoctorAvailability = async (req, res) => {
  const { doctorId } = req.query;
  if (!doctorId) {
    return res.status(400).json({ message: "doctorId required" });
  }

  const today = new Date();
  const days = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD

    const slotsCount = await prisma.doctorAvailability.count({
  where: {
    doctorId: Number(doctorId),
    date: new Date(`${dateStr}T00:00:00.000Z`),
    isBooked: false,
  },
});


    days.push({
      date: dateStr,
      label:
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-IN", {
              weekday: "short",
              // month: "short",
              // day: "numeric",
            }),
      slotsAvailable: slotsCount,
    });
  }

  res.json({ doctorId: Number(doctorId), days });
};

/**
 * 2️⃣ Get slots for selected date
 */
// export const getAvailableSlots = async (req, res) => {
//   const { doctorId, date } = req.query;
//   if (!doctorId || !date) {
//     return res.status(400).json({ message: "doctorId and date required" });
//   }

//   const start = new Date(date);
//   start.setHours(0, 0, 0, 0);

//   const end = new Date(date);
//   end.setHours(23, 59, 59, 999);

//   const slots = await prisma.timeSlot.findMany({
//     where: {
//       doctorId: Number(doctorId),
//       start: { gte: start, lte: end },
//       isActive: true,
//       booking: null,
//     },
//     orderBy: { start: "asc" },
//   });

//   res.json({
//     date,
//     slots: slots.map(s => ({
//       slotId: s.id,
//       time: s.start.toLocaleTimeString("en-IN", {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//       mode: s.consultationMode,
//     })),
//   });
// };
export const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ message: "doctorId and date required" });
  }

  const dateObj = new Date(`${date}T00:00:00.000Z`);

  const slots = await prisma.doctorAvailability.findMany({
    where: {
      doctorId: Number(doctorId),
      date: dateObj, // ✅ Date object
      isBooked: false,
    },
    orderBy: { startTime: "asc" },
  });

  res.json({
    doctorId: Number(doctorId),
    date,
    slots: slots.map(s => ({
      availabilityId: s.id,
      time: `${s.startTime} - ${s.endTime}`,
    })),
  });
};


/**
 * 3️⃣ Hold appointment (SELF / OTHER)
 */
// export const holdAppointment = async (req, res) => {
//   const userId = req.user.id;
//   const { slotId, bookingFor, patient } = req.body;

//   if (!slotId) {
//     return res.status(400).json({ message: "slotId required" });
//   }

//   const slot = await prisma.timeSlot.findUnique({
//     where: { id: Number(slotId) },
//     include: { booking: true },
//   });

//   if (!slot || !slot.isActive || slot.booking) {
//     return res.status(409).json({ message: "Slot not available" });
//   }

//   let patientProfile;

//   if (bookingFor === "SELF") {
//     patientProfile = await prisma.patientProfile.findFirst({
//       where: { userId, isSelf: true },
//     });

//     if (!patientProfile) {
//       const user = await prisma.user.findUnique({ where: { id: userId } });
//       patientProfile = await prisma.patientProfile.create({
//         data: {
//           userId,
//           fullName: user.fullName ?? "Self",
//           phone: user.phone,
//           isSelf: true,
//         },
//       });
//     }
//   } else {
//     if (!patient?.fullName || !patient?.phone) {
//       return res.status(400).json({ message: "Patient details required" });
//     }

//     patientProfile = await prisma.patientProfile.create({
//       data: {
//         userId,
//         fullName: patient.fullName,
//         phone: patient.phone,
//         age: patient.age,
//         gender: patient.gender,
//         isSelf: false,
//       },
//     });
//   }

//   const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//   const booking = await prisma.$transaction(async tx => {
//     const b = await tx.booking.create({
//       data: {
//         timeslotId: slot.id,
//         userId,
//         doctorId: slot.doctorId,
//         patientProfileId: patientProfile.id,
//         start: slot.start,
//         end: slot.end,
//         status: "HOLD",
//         expiresAt,
//       },
//     });

//     await tx.timeSlot.update({
//       where: { id: slot.id },
//       data: { isActive: false },
//     });

//     return b;
//   });

//   res.status(201).json({
//     bookingId: booking.id,
//     expiresAt: booking.expiresAt,
//   });
// };
export const holdAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotId, bookingFor, patient } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: "slotId required" });
    }

    const now = new Date();

    /* ---------------- FETCH SLOT ---------------- */
    const slot = await prisma.timeSlot.findUnique({
      where: { id: Number(slotId) },
      include: {
        booking: {
          where: {
            OR: [
              { status: "CONFIRMED" },
              { status: "HOLD", expiresAt: { gt: now } }
            ]
          }
        }
      }
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (!slot.isActive || slot.booking.length > 0) {
      return res.status(409).json({ message: "Slot not available" });
    }

    /* ---------------- PATIENT PROFILE ---------------- */
    let patientProfile;

    if (bookingFor === "SELF") {
      patientProfile = await prisma.patientProfile.findFirst({
        where: { userId, isSelf: true }
      });

      if (!patientProfile) {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        patientProfile = await prisma.patientProfile.create({
          data: {
            userId,
            fullName: user.fullName ?? "Self",
            phone: user.phone,
            isSelf: true
          }
        });
      }
    } else {
      if (!patient?.fullName || !patient?.phone) {
        return res.status(400).json({ message: "Patient details required" });
      }

      patientProfile = await prisma.patientProfile.create({
        data: {
          userId,
          fullName: patient.fullName,
          phone: patient.phone,
          age: patient.age,
          gender: patient.gender,
          isSelf: false
        }
      });
    }

    /* ---------------- HOLD TRANSACTION ---------------- */
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          timeslotId: slot.id,
          userId,
          doctorId: slot.doctorId,
          patientProfileId: patientProfile.id,
          start: slot.start,
          end: slot.end,
          status: "HOLD",
          expiresAt
        }
      });

      await tx.timeSlot.update({
        where: { id: slot.id },
        data: { isActive: false }
      });

      return createdBooking;
    });

    return res.status(201).json({
      message: "Appointment slot held successfully",
      bookingId: booking.id,
      expiresAt: booking.expiresAt
    });

  } catch (error) {
    console.error("holdAppointment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * 4️⃣ Booking summary (Payment screen)
 */
export const getBookingSummary = async (req, res) => {
  const bookingId = Number(req.params.bookingId);
  const userId = req.user.id;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: {
      patientProfile: true,
      timeSlot: {
        include: {
          doctor: { include: { hospital: true } },
        },
      },
    },
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const fee = booking.timeSlot.doctor.consultationFee;
  const gst = Math.round(fee * 0.18);

  res.json({
    bookingId,
    doctor: booking.timeSlot.doctor.fullName,
    hospital: booking.timeSlot.doctor.hospital.name,
    patient: booking.patientProfile.fullName,
    date: booking.start.toDateString(),
    time: booking.start.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    consultationFee: fee,
    serviceFee: 0,
    gst,
    total: fee + gst,
    status: booking.status,
  });
};

/**
 * 5️⃣ Create Razorpay order
 */
/**
 * 5️⃣ Confirm booking (NO PAYMENT - DEV MODE)
 */
export const createPaymentOrder = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      userId,
      status: "HOLD",
    },
  });

  if (!booking) {
    return res.status(404).json({
      message: "Invalid or expired booking",
    });
  }

  if (booking.expiresAt && booking.expiresAt < new Date()) {
    return res.status(409).json({
      message: "Booking expired",
    });
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CONFIRMED", // ✅ VALID FIELD
    },
  });

  return res.json({
    message: "Appointment confirmed successfully",
    bookingId: booking.id,
    status: "CONFIRMED",
  });
};

export const verifyPaymentAndConfirm = async (req, res) => {
  const {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const booking = await prisma.booking.findFirst({
    where: { id: Number(bookingId), status: "HOLD", orderId: razorpay_order_id },
  });

  if (!booking) {
    return res.status(404).json({ message: "Invalid booking" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CONFIRMED",
      paymentId: razorpay_payment_id,
    },
  });

  res.json({
    message: "Payment successful, appointment confirmed",
    bookingId: booking.id,
  });
};

/**
 * 7️⃣ Doctor calendar view
 */
export const getDoctorBookedSlots = async (req, res) => {
  const doctorId = req.user.id;
  const { date } = req.query;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: { doctorId, start: { gte: start, lte: end } },
    orderBy: { start: "asc" },
  });

  res.json(
    bookings.map(b => ({
      time: `${b.start.toISOString().slice(11, 16)} - ${b.end
        .toISOString()
        .slice(11, 16)}`,
      status: b.status,
    }))
  );
};
