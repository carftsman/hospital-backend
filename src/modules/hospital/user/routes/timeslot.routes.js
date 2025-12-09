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

/**
 * @swagger
 * /api/hospital/user/timeslots:
 *   get:
 *     summary: Get timeslots for doctors or hospital
 *     tags: [Timeslots]
 *     description: "Fetch upcoming available timeslots using either doctorIds (CSV) or hospitalId."
 *
 *     parameters:
 *       - in: query
 *         name: doctorIds
 *         required: false
 *         schema:
 *           type: string
 *         description: "Comma-separated doctor IDs. Example: 1,2,3"
 *
 *       - in: query
 *         name: hospitalId
 *         required: false
 *         schema:
 *           type: integer
 *         description: "Hospital ID (required if doctorIds is not provided)"
 *
 *       - in: query
 *         name: mode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *           default: BOTH
 *         description: "Filter timeslots by consultation mode"
 *
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Start datetime (ISO). Example: 2025-01-10T01:30:00Z"
 *
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "End datetime (ISO). Example: 2025-01-12T23:59:00Z"
 *
 *       - in: query
 *         name: limitPerDoctor
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: "Number of upcoming slots to return per doctor"
 *
 *     responses:
 *       200:
 *         description: "Timeslots retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cached:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   description: "List of doctors with their upcoming timeslots"
 *                   items:
 *                     type: object
 *                     example:
 *                       doctorId: 5
 *                       doctorName: "Dr. Priya Singh"
 *                       mode: "ONLINE"
 *                       timeslots:
 *                         - id: 101
 *                           start: "2025-01-10T10:00:00.000Z"
 *                           end: "2025-01-10T10:30:00.000Z"
 *                           isBooked: false
 *                         - id: 102
 *                           start: "2025-01-10T11:00:00.000Z"
 *                           end: "2025-01-10T11:30:00.000Z"
 *                           isBooked: false
 *
 *       400:
 *         description: "Invalid input. doctorIds or hospitalId is required"
 *
 *       500:
 *         description: "Internal server error"
 */

router.get("/timeslots", getTimeslots);

export default router;
