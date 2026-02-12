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
          OR: [
            { booking: null },
            {
              booking: {
                status: "HOLD",
                expiresAt: { lt: new Date() }
              }
            }
          ]
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
              status: "HOLD",
              expiresAt: { lt: new Date() }
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
        time: `${s.start.toISOString().slice(11, 16)} - ${s.end
          .toISOString()
          .slice(11, 16)}`
      }))
    });
  } catch (e) {
    console.error("getAvailableSlots error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

export const holdAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slotId, bookingFor, reason, patient } = req.body;

    /* ===============================
       VALIDATION
    =============================== */
    if (!slotId || !bookingFor) {
      return res
        .status(400)
        .json({ message: "slotId and bookingFor required" });
    }

    /* ===============================
       FETCH SLOT
    =============================== */
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
      include: { booking: true }
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    /* ===============================
       SLOT ALREADY BOOKED CHECK
    =============================== */
    if (
      slot.booking &&
      (
        slot.booking.status === "CONFIRMED" ||
        (slot.booking.status === "HOLD" &&
          slot.booking.expiresAt > new Date())
      )
    ) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    let patientProfileId = null;

    /* ===============================
       BOOKING FOR OTHER
    =============================== */
    if (bookingFor === "OTHER") {
      if (!patient?.fullName || !patient?.gender) {
        return res.status(400).json({
          message:
            "Patient fullName and gender required for OTHER booking"
        });
      }

      const allowedGenders = ["MALE", "FEMALE", "OTHER"];
      if (!allowedGenders.includes(patient.gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
      }

      const newPatient = await prisma.patientProfile.create({
        data: {
          userId,
          fullName: patient.fullName,
          phone: patient.phone,
          email: patient.email,
          dob: patient.dob ? new Date(patient.dob) : null,
          gender: patient.gender
        }
      });

      patientProfileId = newPatient.id;
    }

    /* ===============================
       BOOKING FOR SELF
    =============================== */
    if (bookingFor === "SELF") {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user?.gender) {
        return res.status(400).json({
          message:
            "Please complete your profile with gender before booking"
        });
      }
    }

    /* ===============================
       HOLD EXPIRY (10 MINUTES)
    =============================== */
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    /* ===============================
       UPSERT BOOKING
    =============================== */
    const booking = await prisma.booking.upsert({
      where: { timeSlotId: slot.id },
      update: {
        userId,
        status: "HOLD",
        expiresAt,
        reason,
        patientProfileId
      },
      create: {
        timeSlotId: slot.id,
        userId,
        doctorId: slot.doctorId,
        start: slot.start,
        end: slot.end,
        status: "HOLD",
        expiresAt,
        reason,
        patientProfileId
      }
    });

    return res.status(201).json({
      bookingId: booking.id,
      expiresAt
    });

  } catch (error) {
    console.error("holdAppointment error:", error);
    return res.status(500).json({ message: "Server error" });
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
        patientProfile: true,
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
    const slot = booking.timeSlot;

    // 💰 Pricing
    const consultationFee = doctor.consultationFee ?? 100;
    const serviceFee = 0;
    const gst = Math.round(consultationFee * 0.18);
    const total = consultationFee + serviceFee + gst;

    // ⏰ Format time (12-hour)
    const formatTime = (date) =>
      new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

    res.json({
      bookingId: booking.id,

      doctor: {
        name: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience ?? 0,
        rating: doctor.rating ?? 4.5,
        reviews: doctor.reviews ?? 0
      },

      patient: booking.patientProfile?.fullName ?? "Self",

      appointment: {
        date: slot.start.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short"
        }),
        time: `${formatTime(slot.start)} - ${formatTime(slot.end)}`
      },

      reason: booking.reason ?? null,

      payment: {
        consultationFee,
        serviceFee,
        gst,
        total
      },

      status: booking.status
    });
  } catch (error) {
    console.error("getBookingSummary error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   5️⃣ MY APPOINTMENTS
====================================================== */
export const getMyAppointments = async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        timeSlot: {
          include: {
            doctor: { include: { hospital: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
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
        appointment: {
          date: b.timeSlot.start,
          time: `${b.timeSlot.start.toISOString().slice(11, 16)} - ${b.timeSlot.end.toISOString().slice(11, 16)}`
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

/* ======================================================
   6️⃣ CONFIRM (DEV MODE)
====================================================== */
export const createPaymentOrder = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId, status: "HOLD" }
    });

    if (!booking) {
      return res.status(404).json({ message: "Invalid booking" });
    }

    if (booking.expiresAt < new Date()) {
      return res.status(409).json({ message: "Booking expired" });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" }
    });

    res.json({
      message: "Appointment confirmed successfully",
      bookingId: booking.id
    });
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   7️⃣ PAYMENT VERIFY
====================================================== */
export const verifyPaymentAndConfirm = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const booking = await prisma.booking.findFirst({
      where: {
        id: Number(bookingId),
        status: "HOLD",
        orderId: razorpay_order_id
      }
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
        paymentId: razorpay_payment_id
      }
    });

    res.json({
      message: "Payment successful",
      bookingId: booking.id
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* ======================================================
   DOCTOR BOOKED SLOTS
====================================================== */
export const getDoctorBookedSlots = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { date } = req.query;

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
        status: "CONFIRMED"
      },
      orderBy: { start: "asc" }
    });

    res.json(
      bookings.map(b => ({
        time: `${b.start.toISOString().slice(11, 16)} - ${b.end
          .toISOString()
          .slice(11, 16)}`,
        status: b.status
      }))
    );

  } catch (error) {
    console.error("getDoctorBookedSlots error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* ======================================================
   8️⃣ PAYMENT SUCCESS DETAILS
====================================================== */
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
      return res.status(404).json({
        message: "Booking not found or not confirmed"
      });
    }

    const doctor = booking.timeSlot.doctor;
    const hospital = doctor.hospital;

    res.json({
      bookingId: booking.id,
      payment: {
        status: "SUCCESS",
        amountPaid: doctor.consultationFee ?? 0,
        hospital: hospital.name
      },
      doctor: {
        name: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience ?? 0,
        rating: doctor.rating ?? 0,
        reviews: 0
      },
      appointment: {
        date: booking.timeSlot.start.toDateString(),
        time: `${booking.timeSlot.start
          .toISOString()
          .slice(11, 16)} - ${booking.timeSlot.end
          .toISOString()
          .slice(11, 16)}`
      },
      hospital: {
        name: hospital.name,
        latitude: hospital.latitude,
        longitude: hospital.longitude
      },
      shareLink: `${process.env.BASE_URL}/appointments/${booking.id}`
    });

  } catch (error) {
    console.error("getPaymentSuccessDetails error:", error);
    res.status(500).json({ message: "Server error" });
  }
};