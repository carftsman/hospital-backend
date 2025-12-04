import express from "express";
import adminAuth from "../../../../middlewares/adminAuth.js";
import {
  createTimeSlots,
  listTimeSlots,
  updateTimeSlot,
  deleteTimeSlot
} from "../controllers/timeslot.controller.js";

const router = express.Router();

router.use(adminAuth);

// Create timeslots for a doctor (supports single or bulk)
router.post("/doctor/:doctorId", createTimeSlots);

// List timeslots for a doctor (admin view)
router.get("/doctor/:doctorId", listTimeSlots);

// Update a timeslot (admin)
router.put("/:id", updateTimeSlot);

// Delete a timeslot (admin)
router.delete("/:id", deleteTimeSlot);

export default router;
