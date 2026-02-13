import { Router } from "express";
import * as controller from "../controllers/labSlot.controller.js";
import { authenticate as auth } from "../../../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Lab Slots
 *     description: Lab slot availability and booking APIs
 */


/**
 * @swagger
 * /api/labs/{labId}/availability:
 *   get:
 *     summary: Get next 14 days lab availability
 *     description: Returns next 14 days with slot counts
 *     tags: [Lab Slots]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Availability fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labId:
 *                   type: integer
 *                   example: 1
 *                 days:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2026-02-14
 *                       label:
 *                         type: string
 *                         example: Today
 *                       slotsAvailable:
 *                         type: integer
 *                         example: 5
 *       400:
 *         description: labId required
 *       500:
 *         description: Internal server error
 */
router.get("/:labId/availability", controller.getLabAvailability);



/* =====================================================
   2️⃣ GET SLOTS FOR SELECTED DATE
===================================================== */

/**
 * @swagger
 * /api/labs/{labId}/slots:
 *   get:
 *     summary: Get available lab slots for selected date
 *     description: Returns formatted slots for a specific lab and date
 *     tags: [Lab Slots]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-02-14
 *
 *     responses:
 *       200:
 *         description: Slots fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labId:
 *                   type: integer
 *                   example: 1
 *                 date:
 *                   type: string
 *                   example: 2026-02-14
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slotId:
 *                         type: integer
 *                         example: 5
 *                       startTime:
 *                         type: string
 *                         example: 09:00 AM
 *                       endTime:
 *                         type: string
 *                         example: 10:00 AM
 *                       time:
 *                         type: string
 *                         example: 09:00 AM - 10:00 AM
 *                       isBooked:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: labId and date required
 *       500:
 *         description: Internal server error
 */
router.get("/:labId/slots", controller.getLabSlots);



// /* =====================================================
//    3️⃣ CHECKOUT (HOLD SLOT)
// ===================================================== */

// /**
//  * @swagger
//  * /api/labs/cart/checkout:
//  *   post:
//  *     summary: Hold lab slot for 10 minutes
//  *     description: Creates booking in HOLD status and locks slot temporarily
//  *     tags: [Lab Slots]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - slotId
//  *               - labTestId
//  *             properties:
//  *               slotId:
//  *                 type: integer
//  *                 example: 5
//  *               labTestId:
//  *                 type: integer
//  *                 example: 3
//  *     responses:
//  *       200:
//  *         description: Slot held successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 bookingId:
//  *                   type: integer
//  *                   example: 12
//  *                 expiresAt:
//  *                   type: string
//  *                   format: date-time
//  *                 message:
//  *                   type: string
//  *                   example: Slot held for 10 minutes
//  *       409:
//  *         description: Slot already booked
//  *       401:
//  *         description: Unauthorized
//  *       500:
//  *         description: Internal server error
//  */
// router.post("/cart/checkout", auth, controller.checkoutLabCart);



// /* =====================================================
//    4️⃣ CONFIRM BOOKING
// ===================================================== */

// /**
//  * @swagger
//  * /api/labs/bookings/confirm:
//  *   post:
//  *     summary: Confirm lab booking after payment
//  *     description: Changes booking status from HOLD to COMPLETED
//  *     tags: [Lab Slots]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - bookingId
//  *             properties:
//  *               bookingId:
//  *                 type: integer
//  *                 example: 12
//  *     responses:
//  *       200:
//  *         description: Booking confirmed successfully
//  *       404:
//  *         description: Invalid booking
//  *       409:
//  *         description: Booking expired
//  *       500:
//  *         description: Internal server error
//  */
// router.post("/bookings/confirm", auth, controller.confirmLabBooking);



// /* =====================================================
//    5️⃣ BOOKING SUCCESS DETAILS
// ===================================================== */

// /**
//  * @swagger
//  * /api/labs/bookings/{bookingId}/success:
//  *   get:
//  *     summary: Get booking success details
//  *     description: Returns booking confirmation details
//  *     tags: [Lab Slots]
//  *     parameters:
//  *       - in: path
//  *         name: bookingId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *           example: 12
//  *     responses:
//  *       200:
//  *         description: Booking details fetched successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 bookingId:
//  *                   type: integer
//  *                 labName:
//  *                   type: string
//  *                 testName:
//  *                   type: string
//  *                 sampleDate:
//  *                   type: string
//  *                   format: date
//  *                 slotTime:
//  *                   type: string
//  *                   example: 09:00 AM - 10:00 AM
//  *                 status:
//  *                   type: string
//  *                   example: COMPLETED
//  *       400:
//  *         description: bookingId required
//  *       404:
//  *         description: Booking not found
//  *       500:
//  *         description: Internal server error
//  */
// router.get("/bookings/:bookingId/success", controller.getLabBookingSuccess);

export default router;
