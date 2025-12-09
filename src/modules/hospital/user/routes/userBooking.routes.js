import express from "express";
import userAuth from "../../../../middlewares/userAuth.js";
import {
  listUserBookings,
  getUserBooking
} from "../controllers/userBooking.controller.js";

const router = express.Router();

router.use(userAuth);

// User order history
/**
 * @swagger
 * /api/hospital/user/listbookings:
 *   get:
 *     summary: Get the logged-in user's booking history
 *     tags: [Bookings]
 *     description: "Returns paginated list of bookings for the authenticated user."
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: "Page number for pagination"
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: "Number of items per page"
 *
 *     responses:
 *       200:
 *         description: "List of user bookings"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     example:
 *                       id: 10
 *                       doctorName: "Dr. Priya"
 *                       hospitalName: "Apollo"
 *                       slotStart: "2025-01-10T10:00:00Z"
 *                       slotEnd: "2025-01-10T10:30:00Z"
 *                       status: "CONFIRMED"
 *
 *       401:
 *         description: "Unauthorized - missing or invalid token"
 *
 *       500:
 *         description: "Server Error"
 */

router.get("/listbookings", listUserBookings);

/**
 * @swagger
 * /api/hospital/user/bookings/{id}:
 *   get:
 *     summary: Get details of a specific booking
 *     tags: [Bookings]
 *     description: "Returns detailed information about a single booking belonging to the authenticated user."
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Booking ID"
 *
 *     responses:
 *       200:
 *         description: "Booking details"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example:
 *                     id: 10
 *                     doctorName: "Dr. Priya"
 *                     hospitalName: "Apollo"
 *                     consultationMode: "ONLINE"
 *                     slotStart: "2025-01-10T10:00:00Z"
 *                     slotEnd: "2025-01-10T10:30:00Z"
 *                     status: "CONFIRMED"
 *
 *       401:
 *         description: "Unauthorized - invalid or missing token"
 *
 *       404:
 *         description: "Booking not found"
 *
 *       500:
 *         description: "Server Error"
 */

// Single booking (detailed)
router.get("/bookings/:id", getUserBooking);

export default router;
