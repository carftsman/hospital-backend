import * as repo from "../repositories/timeslot.repository.js";

/**
 * Normalize slot input (unchanged semantics) but also reject slots in the past
 * and ensure consistent Date objects are returned.
 */
export const normalizeSlotInput = (body) => {
  const slotsInput = Array.isArray(body.slots)
    ? body.slots
    : (body.start && body.end
      ? [{ start: body.start, end: body.end, consultationMode: body.consultationMode }]
      : []);

  if (!slotsInput.length) throw { status: 400, message: "Provide {start,end} or slots array" };

  return slotsInput.map((slot, i) => {
    if (!slot.start || !slot.end)
      throw { status: 400, message: `Slot at index ${i} missing start/end` };

    const start = new Date(slot.start);
    const end = new Date(slot.end);

    if (isNaN(start) || isNaN(end) || start >= end)
      throw { status: 400, message: `Invalid start/end at index ${i}` };

    // Prevent creating slots far in the past
    const now = Date.now();
    if (end.getTime() < now - 1000 * 60 * 5) { // allow slight clock skew, 5 minutes
      throw { status: 400, message: `Slot at index ${i} is in the past` };
    }

    // Enforce reasonable maximum slot duration (e.g., 12 hours)
    const maxDurationMs = 1000 * 60 * 60 * 12;
    if (end.getTime() - start.getTime() > maxDurationMs) {
      throw { status: 400, message: `Slot at index ${i} is too long` };
    }

    const mode = (slot.consultationMode || "BOTH").toUpperCase();
    if (!["ONLINE", "OFFLINE", "BOTH"].includes(mode))
      throw { status: 400, message: `Invalid consultationMode at index ${i}` };

    return { start, end, consultationMode: mode };
  });
};

export const checkDoctorOwnership = async (doctorId, hospitalId) => {
  // Use the repo helper which returns minimal fields (doctor + hospital.consultationMode)
  const doctor = await repo.findDoctorWithHospital(doctorId);

  if (!doctor || doctor.hospitalId !== Number(hospitalId)) {
    throw { status: 404, message: "Doctor not found or not allowed" };
  }

  return doctor; // includes hospital.consultationMode
};

/**
 * Check overlaps in the DB for the provided slots.
 * This is a first-pass check that looks for any overlapping active slots in the time range.
 * The repository method used here is a coarse filter; the actual DB-recheck happens inside createManySlots transaction to prevent race conditions.
 */
export const checkOverlaps = async (doctorId, slots) => {
  const minStart = new Date(Math.min(...slots.map(s => s.start.getTime())));
  const maxEnd = new Date(Math.max(...slots.map(s => s.end.getTime())));

  const overlaps = await repo.findOverlappingSlots(doctorId, minStart, maxEnd);
  if (overlaps.length)
    throw { status: 409, message: "Overlapping slots found", overlaps };
};

/**
 * Create slots atomically. The repository method will re-check overlapping slots inside a transaction
 * to protect against concurrent creators.
 */
export const createSlots = async (doctorId, slots) => {
  return repo.createManySlots(doctorId, slots);
};

export const getTimeslots = async (doctorId, hospitalId, filters) => {
  await checkDoctorOwnership(doctorId, hospitalId);
  return repo.listSlots(doctorId, filters.where, filters.skip, filters.take);
};

export const updateTimeslot = async (slotId, hospitalId, updates) => {
  const slot = await repo.findTimeslotByIdWithDoctor(slotId);
  if (!slot) throw { status: 404, message: "TimeSlot not found" };
  if (slot.doctor.hospitalId !== Number(hospitalId))
    throw { status: 403, message: "Not allowed" };

  const booking = await repo.findBookingForSlot(slotId);
  const isDangerousUpdate =
    updates.isActive === false || updates.start || updates.end;

  if (isDangerousUpdate && booking)
    throw { status: 409, message: "Cannot update timeslot with existing booking" };

  return repo.updateSlot(slotId, updates);
};

export const deleteTimeslot = async (slotId, hospitalId) => {
  const slot = await repo.findTimeslotByIdWithDoctor(slotId);
  if (!slot) throw { status: 404, message: "TimeSlot not found" };
  if (slot.doctor.hospitalId !== Number(hospitalId))
    throw { status: 403, message: "Not allowed" };

  const booking = await repo.findBookingForSlot(slotId);
  if (booking)
    throw { status: 409, message: "Cannot delete a booked slot" };

  return repo.deleteSlot(slotId);
};
