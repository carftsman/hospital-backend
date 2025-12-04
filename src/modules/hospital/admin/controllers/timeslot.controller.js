import * as service from "../services/timeslot.service.js";

/**
 * Create time slots for a doctor.
 * - Normalizes input
 * - Validates against hospital consultationMode
 * - Checks overlaps (service performs DB-level re-check inside transaction)
 * - Uses a simple in-memory idempotency lock to avoid double submissions (dev-only)
 */
const timeslotCreateLocks = new Map();

export const createTimeSlots = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const doctorId = req.params.doctorId;
    console.log("ADMIN:", req.admin);
    console.log("doctorId:", doctorId);

    // Convert input into normalized slots: [{ start, end, consultationMode }]
    const slots = service.normalizeSlotInput(req.body);

    // Basic limits: prevent massive requests
    if (slots.length > 50) {
      return res.status(400).json({ message: "Too many slots in one request (max 50)" });
    }

    // Check doctor and get hospital data (returns doctor + hospital)
    const doctor = await service.checkDoctorOwnership(doctorId, hospitalId);
    const hospitalMode = doctor.hospital.consultationMode; // ONLINE | OFFLINE | BOTH

    // STRICT VALIDATION: ensure consultationMode matches hospital if not BOTH
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (hospitalMode !== "BOTH" && s.consultationMode !== hospitalMode) {
        return res.status(400).json({
          message: `consultationMode at index ${i} must be ${hospitalMode}`
        });
      }
    }

    // IDEMPOTENCY: prevent duplicate submissions (use doctorId + earliestStart + count)
    const earliest = Math.min(...slots.map(s => s.start.getTime()));
    const lockKey = `${doctorId}_${earliest}_${slots.length}`;
    if (timeslotCreateLocks.has(lockKey)) {
      return res.status(409).json({ message: "Duplicate request; processing already." });
    }
    timeslotCreateLocks.set(lockKey, true);

    // Check overlapping & create in one atomic operation inside service
    const created = await service.createSlots(doctorId, slots);

    // release lock
    timeslotCreateLocks.delete(lockKey);

    return res.status(201).json({ message: "Time slots created", data: created });
  } catch (err) {
    // ensure lock cleaned up on error
    try {
      const earliest = Array.isArray(req.body.slots) && req.body.slots.length
        ? Math.min(...req.body.slots.map(s => new Date(s.start).getTime()))
        : undefined;
      const key = earliest ? `${req.params.doctorId}_${earliest}_${(req.body.slots || []).length}` : null;
      if (key && timeslotCreateLocks.has(key)) timeslotCreateLocks.delete(key);
    } catch (e) { /* ignore */ }

    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server Error", ...(err.overlaps && { overlaps: err.overlaps }) });
  }
};


export const listTimeSlots = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const doctorId = req.params.doctorId;

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.onlyActive === "true") where.isActive = true;
    if (req.query.mode) where.consultationMode = req.query.mode.toUpperCase();

    const data = await service.getTimeslots(doctorId, hospitalId, { where, skip, take: limit });

    return res.json({ page, limit, data });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const updateTimeSlot = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const slotId = req.params.id;

    const updated = await service.updateTimeslot(slotId, hospitalId, req.body);

    return res.json({ message: "TimeSlot updated", data: updated });

  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteTimeSlot = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const slotId = req.params.id;

    await service.deleteTimeslot(slotId, hospitalId);

    return res.json({ message: "TimeSlot deleted" });

  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};
