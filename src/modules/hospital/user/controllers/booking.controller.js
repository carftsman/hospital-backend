// src/modules/hospital/user/controllers/booking.controller.js
import * as service from "../services/booking.service.js";

export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { timeslotId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!timeslotId) {
      return res.status(400).json({ message: "timeslotId is required" });
    }

    const booking = await service.bookTimeslot({
      userId,
      timeslotId,
    });

    return res.status(201).json({
      message: "Appointment booked successfully",
      booking: {
        bookingId: booking.id,
        date: booking.start.toISOString().slice(0, 10),
        time: `${booking.start.toISOString().slice(11, 16)} - ${booking.end
          .toISOString()
          .slice(11, 16)}`,
        status: booking.status,
        doctor: booking.timeSlot.doctor,
        hospital: booking.timeSlot.doctor.hospital,
        patient: booking.user,
      },
    });

  } catch (err) {
    if (err.message === "TIMESLOT_NOT_FOUND") {
      return res.status(404).json({ message: "Timeslot not found or inactive" });
    }

    if (err.message === "TIMESLOT_ALREADY_BOOKED") {
      return res.status(409).json({ message: "Timeslot already booked" });
    }

    console.error("Booking error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
