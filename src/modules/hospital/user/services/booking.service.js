// src/modules/hospital/user/services/booking.service.js
import * as repo from "../repositories/booking.repository.js";

export const bookTimeslot = async ({ userId, timeslotId }) => {
  return repo.createBookingTransactional(userId, timeslotId);
};
