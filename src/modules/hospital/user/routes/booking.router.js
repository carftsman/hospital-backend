import express from "express";
import { createBooking } from "../controllers/booking.controller.js";
import userAuth from "../../../../middlewares/userAuth.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

// now protected by userAuth
/**
 * @swagger
 * /api/hospital/user/bookings:
 *   post:
 *     summary: Book a timeslot for the authenticated user
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timeslotId
 *             properties:
 *               timeslotId:
 *                 type: integer
 *                 description: ID of the timeslot to book
 *             example:
 *               timeslotId: 123
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Booked
 *                 booking:
 *                   type: object
 *                   description: Booking object returned from the service
 *       400:
 *         description: Bad request (e.g. missing or invalid timeslotId / timeslot inactive)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: timeslotId is required
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Timeslot not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Timeslot not found
 *       409:
 *         description: Conflict - timeslot already booked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Timeslot already booked
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.post("/bookings", userAuth, nearbyLimiter, createBooking);

export default router;
