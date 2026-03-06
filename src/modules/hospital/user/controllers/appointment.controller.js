import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const getDoctorAvailability = async (req, res) => {
  try {

    const doctorId = Number(req.query.doctorId);

    if (!doctorId) {
      return res.status(400).json({
        message: "doctorId required"
      });
    }

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 12);

    const slots = await prisma.timeSlot.findMany({
      where: {
        doctorId,
        start: {
          gte: today,
          lte: endDate
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
      },
      select: { start: true }
    });

    const map = {};

    slots.forEach(s => {
      const date = s.start.toISOString().slice(0, 10);
      map[date] = (map[date] || 0) + 1;
    });

    const days = [];

    for (let i = 0; i < 12; i++) {

      const d = new Date();
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
        slotsAvailable: map[dateStr] || 0
      });

    }

    res.json({
      doctorId,
      days
    });

  } catch (error) {

    console.error("getDoctorAvailability error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};
export const getAvailableSlots = async (req, res) => {
  try {

    const doctorId = Number(req.query.doctorId);
    const date = req.query.date;

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const slots = await prisma.timeSlot.findMany({
  where: {
    doctorId,
    start: { gte: start, lte: end },
    isActive: true
  },
  include: {
    booking: {
      where: {
        OR: [
          { status: "CONFIRMED" },
          {
            status: "HOLD",
            expiresAt: { gt: new Date() }
          }
        ]
      }
    }
  },
  orderBy: { start: "asc" }
});

    const availableSlots = slots
      .filter(slot => slot.booking.length === 0)
      .map(slot => ({
        slotId: slot.id,
        start: slot.start,
        end: slot.end,
        time:
          slot.start.toISOString().slice(11, 16) +
          " - " +
          slot.end.toISOString().slice(11, 16),
        consultationMode: slot.consultationMode
      }));

    res.json({
      date,
      count: availableSlots.length,
      slots: availableSlots
    });

  } catch (error) {
    console.error("getAvailableSlots error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const holdAppointment = async (req, res) => {

  try {

    const { slotId, consultationMode } = req.body;
    const userId = req.user.id;

    const existingBooking = await prisma.booking.findFirst({
      where: {
        timeSlotId: slotId,
        OR: [
          { status: "CONFIRMED" },
          {
            status: "HOLD",
            expiresAt: { gt: new Date() }
          }
        ]
      }
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "Slot already booked"
      });
    }

    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
      include: {
        doctor: {
          include: { hospital: true }
        }
      }
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        userId,
        doctorId: slot.doctorId,
        start: slot.start,
        end: slot.end,
        timeSlotId: slot.id,
        status: "HOLD",
        expiresAt,
        consultationMode,
        doctorName: slot.doctor.name,
        hospitalName: slot.doctor.hospital.name,
        hospitalId: slot.doctor.hospital.id
      }
    });

    res.json({
      message: "Slot held successfully",
      bookingId: booking.id,
      expiresAt
    });

  } catch (error) {

    console.error("holdAppointment error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

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

    /* ============================
       GET LOGGED-IN USER NAME
    ============================ */
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true }
    });

    const patientName =
      booking.patientProfile?.fullName ||
      user?.fullName ||
      user?.name ||
      "User";

    /* ============================
       PRICING
    ============================ */
    const consultationFee = doctor.consultationFee ?? 100;
    const serviceFee = 0;
    const gst = Math.round(consultationFee * 0.18);
    const total = consultationFee + serviceFee + gst;

    /* ============================
       FORMAT TIME
    ============================ */
    const formatTime = (date) =>
      new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

    return res.json({
      bookingId: booking.id,

      consultationMode: booking.consultationMode || slot.consultationMode || "BOTH", // ✅ added

      doctor: {
        name: doctor.name,
        image: doctor.imageUrl || null,
        specialization: doctor.specialization,
        experience: doctor.experience ?? 0,
        rating: doctor.rating ?? 4.5,
        reviews: doctor.reviews ?? 0
      },

      patient: patientName,

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

export const getMyAppointments = async (req, res) => {
  try {

    const userId = Number(req.query.userId);
    let consultationMode = req.query.consultationMode;

    if (consultationMode === "Instant") {
      consultationMode = "ONLINE";
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const whereCondition = {
      userId,
      status: { not: "EXPIRED" },
      ...(consultationMode && consultationMode !== "ALL"
        ? { consultationMode }
        : {})
    };

    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },

      select: {
        id: true,
        status: true,
        consultationMode: true,
        createdAt: true,
        expiresAt: true,
        reason: true,
        start: true,
        end: true,

        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            bloodGroup: true,
            gender: true,
            DateOfBirth: true
          }
        },

        patientProfile: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            age: true,
            gender: true,
            email: true
          }
        },

        timeSlot: {
          select: {
            start: true,
            end: true
          }
        },

        doctor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            specialization: true,
            qualification: true,
            experience: true,
            consultationFee: true,
            languages: true,
            rating: true,
            consultationMode: true,

            category: {
              select: {
                id: true,
                name: true
              }
            },

            hospital: {
              select: {
                id: true,
                name: true,
                location: true,
                place: true,
                city: true,
                state: true,
                pinCode: true,
                contactName: true,
                contactNumber: true,
                imageUrl: true,
                rating: true,
                isOpen: true,
                open24x7: true
              }
            }
          }
        }
      }
    });

    const upcoming = [];
    const past = [];
    const missed = [];
    const cancelled = [];

    let totalPaidAmount = 0;

    const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);

    const formatTime = (date) =>
      new Date(date).toISOString().slice(11, 16);

    bookings.forEach((b) => {

      const start = b.timeSlot?.start ?? b.start;
      const end = b.timeSlot?.end ?? b.end;

      if (!start || !end) return;

      // -------------------------
      // PATIENT
      // -------------------------
      const patient = b.patientProfile
        ? { type: "OTHER", ...b.patientProfile }
        : { type: "SELF", ...b.user };

      // -------------------------
      // PAYMENT
      // -------------------------
      const consultationFee = b.doctor.consultationFee ?? 0;
      const gst = Math.round(consultationFee * 0.18);
      const amountPaid = consultationFee + gst;

      if (["CONFIRMED", "COMPLETED", "CHECKED_IN"].includes(b.status)) {
        totalPaidAmount += amountPaid;
      }

      const item = {

        booking: {
          id: b.id,
          status: b.status,
          reason: b.reason,
          createdAt: b.createdAt
        },

        consultation: {
          mode: b.consultationMode
        },

        appointment: {
          date: start.toISOString().slice(0, 10),
          time: `${formatTime(start)} - ${formatTime(end)}`,
          start,
          end
        },

        doctor: {
          id: b.doctor.id,
          name: b.doctor.name,
          imageUrl: b.doctor.imageUrl,
          specialization: b.doctor.specialization,
          qualification: b.doctor.qualification,
          experience: b.doctor.experience,
          consultationFee,
          languages: b.doctor.languages,
          rating: Number(b.doctor.rating),
          availableModes: b.doctor.consultationMode
        },

        hospital: b.doctor.hospital,
        category: b.doctor.category,
        patient,

        payment: {
          amountPaid
        }

      };

      // ============================
      // STATUS CLASSIFICATION
      // ============================

      if (b.status === "CANCELLED") {

        cancelled.push(item);

      }

      else if (b.status === "MISSED") {

        missed.push(item);

      }

      else if (b.status === "COMPLETED") {

        past.push(item);

      }

      else if (b.status === "CONFIRMED" && end < now) {

        missed.push(item);

      }

      else if (b.status === "CHECKED_IN") {

        past.push(item);

      }

      else {

        upcoming.push(item);

      }

    });

    res.json({
      total: bookings.length,
      upcoming,
      past,
      missed,
      cancelled
    });

  } catch (error) {

    console.error("getMyAppointments error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};

export const cancelAppointment = async (req, res) => {
  try {

    const bookingId = Number(req.params.bookingId);
    const userId = req.user.id;
    const { reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId is required"
      });
    }

    if (!reason) {
      return res.status(400).json({
        message: "Cancellation reason is required"
      });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId
      }
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const blockedStatuses = [
      "CANCELLED",
      "COMPLETED",
      "MISSED",
      "CHECKED_IN"
    ];

    if (blockedStatuses.includes(booking.status)) {
      return res.status(400).json({
        message: "Appointment cannot be cancelled"
      });
    }

    const now = new Date();

    if (booking.end < now) {
      return res.status(400).json({
        message: "Past appointments cannot be cancelled"
      });
    }

    // ===============================
    // CANCEL BOOKING
    // ===============================

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        reason
      }
    });

    res.json({
      message: "Appointment cancelled successfully",
      bookingId,
      status: "CANCELLED",
      reason
    });

  } catch (error) {

    console.error("cancelAppointment error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};
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
      bookingId: booking.id,
      consultationMode: booking.consultationMode // ✅ added here

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
export const getPaymentSuccessDetails = async (req, res) => {
  try {

    const bookingId = Number(req.params.bookingId);
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        status: {
          in: ["CONFIRMED", "COMPLETED"]
        }
      },
      include: {
        user: true,
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
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const doctor = booking.timeSlot.doctor;
    const hospital = doctor.hospital;

    // =========================
    // PATIENT DETAILS
    // =========================

    const patient = booking.patientProfile
      ? {
          type: "OTHER",
          id: booking.patientProfile.id,
          fullName: booking.patientProfile.fullName,
          phone: booking.patientProfile.phone,
          age: booking.patientProfile.age,
          gender: booking.patientProfile.gender,
          email: booking.patientProfile.email
        }
      : {
          type: "SELF",
          id: booking.user.id,
          fullName: booking.user.fullName,
          phone: booking.user.phone,
          email: booking.user.email,
          bloodGroup: booking.user.bloodGroup,
          gender: booking.user.gender,
          DateOfBirth: booking.user.DateOfBirth
        };

    const consultationFee = doctor.consultationFee ?? 0;

    res.json({

      bookingId: booking.id,

      // ✅ BOOKING CREATED TIME
      bookedAt: booking.createdAt,

      consultationMode:
        booking.consultationMode ||
        booking.timeSlot.consultationMode ||
        "BOTH",

      payment: {
        status: "SUCCESS",
        amountPaid: consultationFee,
        hospital: hospital.name
      },

      doctor: {
        name: doctor.name,
        image: doctor.imageUrl || null,
        specialization: doctor.specialization,
        experience: doctor.experience ?? 0,
        rating: doctor.rating ?? 0,
        reviews: doctor.reviews ?? 0
      },

      appointment: {
        date: booking.timeSlot.start.toDateString(),
        time:
          booking.timeSlot.start.toISOString().slice(11,16) +
          " - " +
          booking.timeSlot.end.toISOString().slice(11,16)
      },

      hospital: {
        name: hospital.name,
        latitude: hospital.latitude,
        longitude: hospital.longitude
      },

      // ✅ PATIENT FULL DETAILS
      patient,

      shareLink: `${process.env.BASE_URL || "https://hospital-backend-1-9jq0.onrender.com"}/appointments/${booking.id}`

    });

  } catch (error) {

    console.error("getPaymentSuccessDetails error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};