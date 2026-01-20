// src/modules/hospital/user/controllers/appointment.controller.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import crypto from "crypto";

/**
 * GET next 14 days
 */
export const getNextTwoWeeksDates = async (req, res) => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    dates.push({
      value: d.toISOString().slice(0, 10),
      label: d.toDateString(),
    });
  }

  return res.json(dates);
};

/**
 * GET available slots
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: "doctorId and date are required",
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const slots = await prisma.timeSlot.findMany({
      where: {
        doctorId: Number(doctorId),
        start: { gte: start, lte: end },
        isActive: true,
        booking: null,
      },
      orderBy: { start: "asc" },
      select: {
        id: true,
        start: true,
        end: true,
        consultationMode: true,
      },
    });

    return res.json({
      doctorId,
      date,
      availableSlots: slots.map(s => ({
        slotId: s.id,
        start: s.start,
        end: s.end,
        consultationMode: s.consultationMode,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * PATIENT books appointment (SELF / OTHER)
 */


const HOLD_MINUTES = 5;

export const bookByPatient = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeslotId, bookingFor, patient } = req.body;

    if (!timeslotId) {
      return res.status(400).json({ message: "timeslotId required" });
    }

    // 1️⃣ Get slot
    const slot = await prisma.timeSlot.findUnique({
      where: { id: Number(timeslotId) },
      include: { booking: true },
    });

    if (!slot || !slot.isActive) {
      return res.status(404).json({ message: "Slot not available" });
    }

    if (slot.booking) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    // 2️⃣ Resolve patient profile
    let patientProfile;

    if (bookingFor === "SELF") {
      patientProfile = await prisma.patientProfile.findFirst({
        where: { userId, isSelf: true },
      });

      if (!patientProfile) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        patientProfile = await prisma.patientProfile.create({
          data: {
            userId,
            fullName: user.fullName ?? "Self",
            phone: user.phone,
            isSelf: true,
          },
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
          isSelf: false,
        },
      });
    }

    // 3️⃣ HOLD booking (10 min expiry)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          timeslotId: slot.id,
          userId,
          doctorId: slot.doctorId,
          patientProfileId: patientProfile.id,
          start: slot.start,
          end: slot.end,
          status: "HOLD",
          expiresAt,
        },
      });

      await tx.timeSlot.update({
        where: { id: slot.id },
        data: { isActive: false },
      });

      return b;
    });

    return res.status(201).json({
      message: "Slot held successfully",
      bookingId: booking.id,
      expiresAt: booking.expiresAt,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET booking summary
 */
export const getBookingSummary = async (req, res) => {
  const appointmentId = Number(req.params.appointmentId);
  const userId = req.user.id;

  if (!appointmentId) {
    return res.status(400).json({ message: "appointmentId is required" });
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: appointmentId,
      userId,
    },
    include: {
      patientProfile: true,
      timeSlot: {
        include: {
          doctor: {
            include: { hospital: true },
          },
        },
      },
    },
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.json({
    bookingId: booking.id,
    status: booking.status,
    expiresAt: booking.expiresAt,
    date: booking.start.toISOString().slice(0, 10),
    time: `${booking.start.toISOString().slice(11, 16)} - ${booking.end
      .toISOString()
      .slice(11, 16)}`,
    doctor: booking.timeSlot.doctor,
    hospital: booking.timeSlot.doctor.hospital,
    patient: booking.patientProfile,
  });
};

export const confirmBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        id: Number(bookingId),
        userId,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "CONFIRMED") {
      return res.status(409).json({ message: "Already confirmed" });
    }

    if (booking.status !== "HOLD") {
      return res.status(409).json({ message: "Booking not in HOLD state" });
    }

    if (booking.expiresAt < new Date()) {
      return res.status(409).json({ message: "Booking expired" });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    });

    return res.json({
      message: "Appointment confirmed successfully",
      bookingId: booking.id,
      status: "CONFIRMED",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DOCTOR booked slots
 */
export const verifyPaymentAndConfirm = async (req, res) => {
  const {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      status: "HOLD",
      orderId: razorpay_order_id,
    },
  });

  if (!booking) {
    return res.status(404).json({ message: "Invalid booking" });
  }

  // 🔐 Signature verification
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  // ✅ CONFIRM booking
  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
        paymentId: razorpay_payment_id,
      },
    });

    await tx.timeSlot.update({
      where: { id: booking.timeslotId },
      data: { isActive: false },
    });
  });

  res.json({
    message: "Payment successful, booking confirmed",
    bookingId: booking.id,
  });
};

export const getDoctorBookedSlots = async (req, res) => {
  const { date } = req.query;
  const doctorId = req.user.id;

  if (!date) {
    return res.status(400).json({ message: "date required" });
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      doctorId,
      start: { gte: start, lte: end },
    },
    include: {
      user: { select: { fullName: true, phone: true } },
    },
    orderBy: { start: "asc" },
  });

  return res.json(
    bookings.map(b => ({
      time: `${b.start.toISOString().slice(11, 16)} - ${b.end
        .toISOString()
        .slice(11, 16)}`,
      patient: {
        fullName: b.user?.fullName,
        phone: b.user?.phone,
      },
    }))
  );
};

export const createPaymentOrder = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      userId,
      status: "HOLD",
    },
    include: {
      timeSlot: { include: { doctor: true } },
    },
  });

  if (!booking) {
    return res.status(404).json({ message: "Invalid or expired booking" });
  }

  const amount = booking.timeSlot.doctor.consultationFee * 100;

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `booking_${booking.id}`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { orderId: order.id },
  });

  res.json({
    orderId: order.id,
    amount,
    currency: "INR",
    key: process.env.RAZORPAY_KEY_ID,
  });
};
