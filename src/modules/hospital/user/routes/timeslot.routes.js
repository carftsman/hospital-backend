import express from "express";
import { getTimeslots } from "../controllers/timeslot.controller.js";

const router = express.Router();

/**
 * GET /api/hospital/user/timeslots
 * Query params:
 *   doctorIds (csv) OR hospitalId (one of them required)
 *   mode = ONLINE|OFFLINE|BOTH (default BOTH)
 *   from = ISO datetime (optional) - lower bound (inclusive)
 *   to   = ISO datetime (optional) - upper bound (inclusive)
 *   limitPerDoctor = integer (default 5) - how many upcoming slots per doctor
 */
router.get("/timeslots", getTimeslots);

export default router;
