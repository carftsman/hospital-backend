import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();


/* ======================================================
   1️⃣ DOCTOR AVAILABILITY (NEXT 12 DAYS)
====================================================== */
export const getDoctorAvailability = async (req, res) => {
  try {
    const doctorId = Number(req.query.doctorId);
    if (!doctorId) {
      return res.status(400).json({ message: "doctorId required" });
    }

    const today = new Date();
    const days = [];

    for (let i = 0; i < 12; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = d.toISOString().slice(0, 10);

      const slotsAvailable = await prisma.timeSlot.count({
        where: {
          doctorId,
          start: {
            gte: new Date(`${dateStr}T00:00:00.000Z`),
            lte: new Date(`${dateStr}T23:59:59.999Z`)
          },
          isActive: true,
          booking: null   // ✅ FIXED (lowercase)
        }
      });

      days.push({
        date: dateStr,
        label:
          i === 0
            ? "Today"
            : i === 1
            ? "Tomorrow"
            : d.toLocaleDateString("en-IN", { weekday: "short" }),
        slotsAvailable
      });
    }

    res.json({ doctorId, days });

  } catch (e) {
    console.error("getDoctorAvailability error:", e);
    res.status(500).json({ message: "Server error" });
  }
};


/* ======================================================
   2️⃣ GET AVAILABLE SLOTS
====================================================== */
export const getAvailableSlots = async (req, res) => {
  try {
    const doctorId = Number(req.query.doctorId);
    const date = req.query.date;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "doctorId and date required" });
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const slots = await prisma.timeSlot.findMany({
      where: {
        doctorId,
        start: { gte: start, lte: end },
        isActive: true,
        OR: [
          { booking: null },
          {
            booking: {
              status: "HOLD"
,
              expiresAt: { lt: new Date() } // ✅ FIXED
            }
          }
        ]
      },
      orderBy: { start: "asc" }
    });

    res.json({
      date,
      count: slots.length,
      slots: slots.map(s => ({
        slotId: s.id,
        start: s.start,
        end: s.end,
        time: `${s.start.toTimeString().slice(0, 5)} - ${s.end
          .toTimeString()
          .slice(0, 5)}`
      }))
    });
  } catch (e) {
    console.error("getAvailableSlots error:", e);
    res.status(500).json({ message: "Server error" });
  }
};



/* ======================================================
   3️⃣ HOLD APPOINTMENT
====================================================== */
export const holdAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: "slotId required" });
    }

    const slot = await prisma.timeSlot.findUnique({
      where: { id: Number(slotId) },
      include: { booking: true }
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (
      slot.booking &&
      (slot.booking.status === "CONFIRMED" ||
        (slot.booking.status === "PENDING" &&
          slot.booking.expiresAt > new Date()))
    ) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await prisma.booking.upsert({
      where: { timeSlotId: slot.id },
      update: {
        userId,
        status: "HOLD"
,
        expiresAt
      },
      create: {
        timeSlotId: slot.id,
        userId,
        doctorId: slot.doctorId,
        start: slot.start,
        end: slot.end,
        status: "HOLD"
,
        expiresAt
      }
    });

    res.status(201).json({
      bookingId: booking.id,
      expiresAt
    });
  } catch (e) {
    console.error("holdAppointment error:", e);
    res.status(500).json({ message: "Server error" });
  }
};


/* ======================================================
   4️⃣ BOOKING SUMMARY
====================================================== */
export const getBookingSummary = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        user: {
          include: {
            patientProfiles: true
          }
        },
        timeSlot: {
          include: {
            doctor: {
              include: {
                hospital: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      bookingId: booking.id,
      doctor: booking.timeSlot.doctor.name,
      hospital: booking.timeSlot.doctor.hospital.name,
      patient: booking.user.patientProfiles?.[0]?.fullName ?? "Self",
      date: booking.timeSlot.start.toDateString(),
      time: `${booking.timeSlot.start.toTimeString().slice(0,5)} - ${booking.timeSlot.end.toTimeString().slice(0,5)}`,
      status: booking.status
    });

  } catch (error) {
    console.error("getBookingSummary error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ======================================================
   5️⃣ MY APPOINTMENTS (PAST + UPCOMING)
====================================================== */
export const getMyAppointments = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        user: {
          include: {
            patientProfiles: true
          }
        },
        timeSlot: {
          include: {
            doctor: {
              include: {
                hospital: true
              }
            }
          }
        }
      },
      orderBy: { start: "desc" }
    });

    const now = new Date();
    const pastAppointments = [];
    const upcomingAppointments = [];

    bookings.forEach(b => {
      const item = {
        bookingId: b.id,
        status: b.status,
        doctor: {
          name: b.timeSlot.doctor.name,
          hospital: b.timeSlot.doctor.hospital.name
        },
        patient: b.user.patientProfiles?.[0]?.fullName ?? "Self",
        appointment: {
          date: b.timeSlot.start.toDateString(),
          time: `${b.timeSlot.start.toTimeString().slice(0,5)} - ${b.timeSlot.end.toTimeString().slice(0,5)}`
        }
      };

      if (b.timeSlot.end < now) {
        pastAppointments.push(item);
      } else {
        upcomingAppointments.push(item);
      }
    });

    res.json({ pastAppointments, upcomingAppointments });

  } catch (error) {
    console.error("getMyAppointments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const createPaymentOrder = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      userId,
      status: "HOLD"

,
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
    where: { id: Number(bookingId), status: "HOLD"

, orderId: razorpay_order_id },
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

/**
 * 9️⃣ Get all bookings of logged-in user (Past + Upcoming)
 */
/**
 * 9️⃣ Get all bookings of logged-in user
 * Returns pastAppointments & upcomingAppointments separately
 */


// 8️⃣ Payment success details
export const getPaymentSuccessDetails = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        status: "CONFIRMED"
      },
      include: {
        timeSlot: {
          include: {
            doctor: {
              include: {
                hospital: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const doctor = booking.timeSlot.doctor;
    const hospital = doctor.hospital;

    res.json({
      bookingId: booking.id,
      doctor: doctor.name,
      hospital: hospital.name,
      date: booking.timeSlot.start,
      time: `${booking.timeSlot.start.toTimeString().slice(0,5)} - ${booking.timeSlot.end.toTimeString().slice(0,5)}`
    });

  } catch (error) {
    console.error("getPaymentSuccessDetails error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
