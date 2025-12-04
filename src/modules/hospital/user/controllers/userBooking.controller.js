import * as service from "../services/userBooking.service.js";

export const listUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const result = await service.listUserBookings(userId, skip, limit);

    return res.json({ page, limit, data: result.rows, total: result.count });
  } catch (err) {
    console.error("listUserBookings error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getUserBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = Number(req.params.id);

    const booking = await service.getUserBooking(userId, bookingId);

    return res.json({ data: booking });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("getUserBooking error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
