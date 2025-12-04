import * as repo from "../repositories/booking.repository.js";

/**
 * Book a timeslot for a user.
 * - userId: number
 * - timeslotId: number
 *
 * Returns booking row with related timeslot/doctor/hospital info.
 */
export const bookTimeslot = async ({ userId, timeslotId }) => {
  // You could add extra checks here (user validations, KYC, wallet balance etc.)
  // Call repository to do atomic DB transaction.
  const booking = await repo.createBookingTransactional(userId, timeslotId);

  // After DB commit, we can trigger async notification (non-blocking).
  // repo.createBookingTransactional already calls the notification hook synchronously inside tx for consistency,
  // but if you want push notification/email you can call an async notifier here (fire-and-forget).
  // e.g. notifyHospitalBooking(booking).catch(console.error);

  return booking;
};
