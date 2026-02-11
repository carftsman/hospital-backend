import prisma from "../../../../prisma/client.js";
import * as service from "../services/labSlot.service.js";

// GET SLOTS
export const getLabSlots = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const { date } = req.query;

    if (!labId || !date) {
      return res.status(400).json({
        message: "labId and date are required"
      });
    }

    const slots = await service.getSlotsByDate(labId, date);

    res.json({
      labId,
      date,
      slots
    });

  } catch (error) {
    console.error("getLabSlots error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GENERATE 14 DAYS SLOTS
export const generateLab14DaySlots = async (req, res) => {
  try {
    const labId = Number(req.params.labId);

    if (!labId) {
      return res.status(400).json({
        message: "labId is required"
      });
    }

    const result = await service.generate14DaysSlots(labId);

    res.json(result);

  } catch (error) {
    console.error("generateLab14DaySlots error:", error);
    res.status(500).json({ message: error.message });
  }
};
