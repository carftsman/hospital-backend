// src/modules/hospital/user/routes/appointments.routes.js
import { Router } from "express";
import * as controller from "../controllers/appointment.controller.js";
import { authenticate as auth } from "../../../../middlewares/auth.middleware.js";
import { role } from "../../../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment booking and scheduling APIs
 */

/**
 * @swagger
 * /api/appointments/availability:
 *   get:
 *     summary: Get doctor availability for next 12 days
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Doctor availability
 *         content:
 *           application/json:
 *             example:
 *               doctorId: 12
 *               days:
 *                 - date: "2026-01-26"
 *                   label: "Today"
 *                   slotsAvailable: 8
 *                 - date: "2026-01-27"
 *                   label: "Tomorrow"
 *                   slotsAvailable: 5
 */
router.get("/availability", auth, controller.getDoctorAvailability);

/**
 * @swagger
 * /api/appointments/slots:
 *   get:
 *     summary: Get available slots for a doctor on a selected date
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-01-26
 *     responses:
 *       200:
 *         description: Available slots
 *         content:
 *           application/json:
 *             example:
 *               date: "2026-01-26"
 *               slots:
 *                 - slotId: 101
 *                   time: "10:30 AM"
 *                   mode: "ONLINE"
 *                 - slotId: 102
 *                   time: "11:00 AM"
 *                   mode: "OFFLINE"
 */
router.get("/slots", auth, controller.getAvailableSlots);

/**
 * @swagger
 * /api/appointments/hold:
 *   post:
 *     summary: Hold an appointment slot (Self or Other)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             SELF:
 *               value:
 *                 slotId: 101
 *                 bookingFor: SELF
 *             OTHER:
 *               value:
 *                 slotId: 101
 *                 bookingFor: OTHER
 *                 patient:
 *                   fullName: "Suresh Kumar"
 *                   phone: "9876543210"
 *                   age: 45
 *                   gender: MALE
 *     responses:
 *       201:
 *         description: Slot held successfully
 *         content:
 *           application/json:
 *             example:
 *               bookingId: 55
 *               expiresAt: "2026-01-26T10:40:00Z"
 */
router.post("/hold", auth, role("USER"), controller.holdAppointment);

/**
 * @swagger
 * /api/appointments/{bookingId}:
 *   get:
 *     summary: Get booking summary
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 55
 *     responses:
 *       200:
 *         description: Booking summary
 *         content:
 *           application/json:
 *             example:
 *               bookingId: 55
 *               doctor: "Dr. John Wick"
 *               hospital: "PACE Hospitals"
 *               patient: "Surya"
 *               date: "Wed Jan 26"
 *               time: "10:30 AM"
 *               consultationFee: 500
 *               serviceFee: 0
 *               gst: 90
 *               total: 590
 *               status: "HOLD"
 */
router.get("/:bookingId", auth, role("USER"), controller.getBookingSummary);

/**
 * @swagger
 * /api/appointments/{bookingId}/payment:
 *   post:
 *     summary: Confirm appointment (No payment - DEV mode)
 *     description: >
 *       Temporarily confirms an appointment without payment.
 *       Used when Razorpay is not integrated.
 *       Booking must be in HOLD state.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Appointment confirmed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Appointment confirmed successfully (no payment)"
 *               bookingId: 2
 *               status: "CONFIRMED"
 *       404:
 *         description: Invalid or expired booking
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid or expired booking"
 *       409:
 *         description: Booking expired
 *         content:
 *           application/json:
 *             example:
 *               message: "Booking expired"
 */
router.post(
  "/:bookingId/payment",
  auth,
  role("USER"),
  controller.createPaymentOrder
);


/**
 * @swagger
 * /api/appointments/payment/verify:
 *   post:
 *     summary: Verify payment and confirm booking
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             bookingId: 55
 *             razorpay_order_id: "order_NpQk1abc123"
 *             razorpay_payment_id: "pay_NpQkXYZ789"
 *             razorpay_signature: "d4c2b1e5..."
 *     responses:
 *       200:
 *         description: Booking confirmed
 *         content:
 *           application/json:
 *             example:
 *               message: "Payment successful, appointment confirmed"
 *               bookingId: 55
 */
router.post(
  "/payment/verify",
  auth,
  role("USER"),
  controller.verifyPaymentAndConfirm
);

/**
 * @swagger
 * /api/appointments/doctor:
 *   get:
 *     summary: Doctor views booked slots for a date
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-01-26
 *     responses:
 *       200:
 *         description: Doctor booked slots
 *         content:
 *           application/json:
 *             example:
 *               - time: "10:30 - 11:00"
 *                 status: "CONFIRMED"
 */
router.get(
  "/doctor",
  auth,
  role("DOCTOR"),
  controller.getDoctorBookedSlots
);

export default router;
 