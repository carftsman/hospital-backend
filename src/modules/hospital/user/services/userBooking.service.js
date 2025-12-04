import * as repo from "../repositories/userBooking.repository.js";

export const listUserBookings = async (userId, skip, take) => {
  const [rows, count] = await Promise.all([
    repo.findBookingsForUser(userId, skip, take),
    repo.countBookingsForUser(userId)
  ]);

  return { rows, count };
};

export const getUserBooking = async (userId, bookingId) => {
  const booking = await repo.findBookingDetails(userId, bookingId);

  if (!booking) {
    throw { status: 404, message: "Booking not found or not allowed" };
  }

  return booking;
};
