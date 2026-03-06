import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const checkInAppointment = async (req, res) => {

  try {

    const bookingId = Number(req.params.bookingId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({
        message: "Only confirmed bookings can check-in"
      });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CHECKED_IN" }
    });

    res.json({
      message: "Patient checked in successfully",
      bookingId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
export const completeAppointment = async (req, res) => {

  try {

    const bookingId = Number(req.params.bookingId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status !== "CHECKED_IN") {
      return res.status(400).json({
        message: "Patient must check-in first"
      });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" }
    });

    res.json({
      message: "Appointment completed",
      bookingId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
export const markNoShow = async (req, res) => {

  try {

    const bookingId = Number(req.params.bookingId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "MISSED" }
    });

    res.json({
      message: "Appointment marked as missed",
      bookingId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};  