import { bookTimeslot } from "../services/booking.service.js";

export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { timeslotId } = req.body;
    if (!timeslotId || Number.isNaN(Number(timeslotId))) {
      return res.status(400).json({ message: "timeslotId is required" });
    }

    const booking = await bookTimeslot({ userId: Number(userId), timeslotId: Number(timeslotId) });

    // booking succeeded
    return res.status(201).json({ message: "Booked", booking });
  } catch (err) {
    // Known conflict / validation responses from service
    if (err?.code === "SLOT_NOT_FOUND") {
      return res.status(404).json({ message: "Timeslot not found" });
    }
    if (err?.code === "SLOT_INACTIVE") {
      return res.status(400).json({ message: "Timeslot is not available" });
    }
    if (err?.code === "ALREADY_BOOKED" || err?.code === "CONFLICT") {
      return res.status(409).json({ message: "Timeslot already booked" });
    }
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Internal server error", error: String(err) });
  }
};
