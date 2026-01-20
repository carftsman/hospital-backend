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
 * /api/appointments/dates:
 *   get:
 *     summary: Get next 14 days for appointment booking
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming dates
 */
router.get("/dates", auth, controller.getNextTwoWeeksDates);

/**
 * @swagger
 * /api/appointments/available:
 *   get:
 *     summary: Get available time slots for a doctor on a selected date
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Available slots
 */
router.get("/available", auth, controller.getAvailableSlots);


/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment booking and scheduling APIs
 */

/**
 * @swagger
 * /api/appointments/patient/book:
 *   post:
 *     summary: Book appointment (Self or Other)
 *     description: >
 *       By default booking is for OTHER.
 *       - If bookingFor = OTHER → patient details are required
 *       - If bookingFor = SELF → patient details are ignored
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/BookForOther'
 *               - $ref: '#/components/schemas/BookForSelf'
 *           examples:
 *             OTHER:
 *               summary: Booking for someone else
 *               value:
 *                 timeslotId: 10
 *                 bookingFor: OTHER
 *                 patient:
 *                   fullName: Suresh Kumar
 *                   phone: "9876543210"
 *                   age: 45
 *                   gender: MALE
 *
 *             SELF:
 *               summary: Booking for self
 *               value:
 *                 timeslotId: 10
 *                 bookingFor: SELF
 *
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Slot already booked
 */
router.post(
  "/patient/book",
  auth,
  role("USER"),
  controller.bookByPatient
);




/**
 * @swagger
 * /api/appointments/doctor/booked:
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
 */
router.get(
  "/doctor/booked",
  auth,
  role("DOCTOR"),
  controller.getDoctorBookedSlots
);

/**
 * @swagger
 * /api/appointments/summary/{appointmentId}:
 *   get:
 *     summary: Get booking summary
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 */

/**
 * @swagger
 * /api/appointments/summary/{appointmentId}:
 *   get:
 *     summary: Get booking summary
 *     description: Returns full appointment details including doctor, hospital, patient and time
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 13
 *     responses:
 *       200:
 *         description: Booking summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingSummaryResponse'
 *       400:
 *         description: Invalid appointmentId
 *       404:
 *         description: Booking not found
 */
router.get(
  "/summary/:appointmentId",
  auth,
  controller.getBookingSummary
);

/**
 * @swagger
 * /api/appointments/confirm/{bookingId}:
 *   post:
 *     summary: Confirm a held booking
 *     description: Confirms a booking that is in HOLD state
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking confirmed
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking expired or already confirmed
 */
router.post(
  "/confirm/:bookingId",
  auth,
  role("USER"),
  controller.confirmBooking
);
/**
 * @swagger
 * /api/appointments/payment/order/{bookingId}:
 *   post:
 *     summary: Create Razorpay payment order for a held booking
 *     description: >
 *       Creates a Razorpay order for a booking in HOLD state.
 *       This must be called before opening Razorpay payment UI.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: Razorpay order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   example: order_NpQk1abc123
 *                 amount:
 *                   type: integer
 *                   example: 60000
 *                 currency:
 *                   type: string
 *                   example: INR
 *                 key:
 *                   type: string
 *                   example: rzp_test_xxxxx
 *       404:
 *         description: Booking not found or expired
 */
router.post(
  "/payment/order/:bookingId",
  auth,
  role("USER"),
  controller.createPaymentOrder
);
/**
 * @swagger
 * /api/appointments/payment/verify:
 *   post:
 *     summary: Verify Razorpay payment and confirm booking
 *     description: >
 *       Verifies Razorpay payment signature and confirms
 *       a booking that is in HOLD state.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 15
 *               razorpay_order_id:
 *                 type: string
 *                 example: order_NpQk1abc123
 *               razorpay_payment_id:
 *                 type: string
 *                 example: pay_NpQkXYZ789
 *               razorpay_signature:
 *                 type: string
 *                 example: d4c2b1e5f9a7...
 *     responses:
 *       200:
 *         description: Payment verified and booking confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment successful, booking confirmed
 *                 bookingId:
 *                   type: integer
 *                   example: 15
 *       400:
 *         description: Payment verification failed
 *       404:
 *         description: Booking not found or expired
 *       409:
 *         description: Booking already confirmed or expired
 */
router.post(
  "/payment/verify",
  auth,
  role("USER"),
  controller.verifyPaymentAndConfirm
);

export default router;
