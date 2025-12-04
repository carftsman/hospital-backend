// src/modules/hospital/admin/controllers/openStatus.controller.js

import { setHospitalOpenStatus, getHospitalOpenStatus } from "../services/openStatus.service.js";

// Simple in-memory lock to prevent double toggling in dev
const toggleLocks = new Map();

export const updateOpenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOpen } = req.body;

    // Validate isOpen
    if (typeof isOpen !== "boolean") {
      return res.status(400).json({ message: "isOpen must be true or false" });
    }

    // Ownership check
    if (req.admin.hospitalId !== Number(id)) {
      return res.status(403).json({
        message: "You are not allowed to modify another hospital"
      });
    }

    // ----- IDEMPOTENCY (avoid multiple rapid toggles) -----
    const lockKey = `hospital_toggle_${id}`;
    if (toggleLocks.has(lockKey)) {
      return res.status(409).json({
        message: "Another toggle is already processing"
      });
    }
    toggleLocks.set(lockKey, true);
    setTimeout(() => toggleLocks.delete(lockKey), 3000); // auto release 3 sec
    // ------------------------------------------------------

    // If status is already same → return fast (perf)
    const currentStatus = await getHospitalOpenStatus(Number(id));
    if (currentStatus === isOpen) {
      toggleLocks.delete(lockKey);
      return res.json({
        message: `Hospital already ${isOpen ? "Open" : "Closed"}`,
        data: { id: Number(id), isOpen }
      });
    }

    // Update
    const updated = await setHospitalOpenStatus(Number(id), isOpen);

    toggleLocks.delete(lockKey);

    return res.json({
      message: `Hospital is now ${isOpen ? "Open" : "Closed"}`,
      data: updated
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
