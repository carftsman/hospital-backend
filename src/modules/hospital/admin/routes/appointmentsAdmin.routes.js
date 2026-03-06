import express from "express";
import {
  checkInAppointment,
  completeAppointment,
  markNoShow
} from "../controllers/appointmentAdmin.controller.js";

const router = express.Router();
/**
 * @swagger
 * /api/admin/appointments/{bookingId}/check-in:
 *   patch:
 *     summary: Check-in patient for appointment
 *     description: Hospital admin marks the patient as arrived at the hospital.
 *     tags:
 *       - Hospital Admin - Appointments
 *
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID of the appointment
 *
 *     responses:
 *       200:
 *         description: Patient checked-in successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Patient checked in successfully
 *               bookingId: 12
 *
 *       400:
 *         description: Only confirmed bookings can check-in
 *
 *       404:
 *         description: Booking not found
 */
router.patch("/admin/appointments/:bookingId/check-in", checkInAppointment);
/**
 * @swagger
 * /api/admin/appointments/{bookingId}/complete:
 *   patch:
 *     summary: Complete appointment
 *     description: Doctor or hospital admin marks the consultation as completed.
 *     tags:
 *       - Hospital Admin - Appointments
 *
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID of the appointment
 *
 *     responses:
 *       200:
 *         description: Appointment completed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Appointment completed
 *               bookingId: 12
 *
 *       400:
 *         description: Patient must check-in first
 *
 *       404:
 *         description: Booking not found
 */
router.patch("/admin/appointments/:bookingId/complete", completeAppointment);
/**
 * @swagger
 * /api/admin/appointments/{bookingId}/no-show:
 *   patch:
 *     summary: Mark appointment as missed
 *     description: Hospital admin marks the appointment as missed if patient did not arrive.
 *     tags:
 *       - Hospital Admin - Appointments
 *
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID of the appointment
 *
 *     responses:
 *       200:
 *         description: Appointment marked as missed
 *         content:
 *           application/json:
 *             example:
 *               message: Appointment marked as missed
 *               bookingId: 12
 *
 *       404:
 *         description: Booking not found
 */
router.patch("/admin/appointments/:bookingId/no-show", markNoShow);
export default router;
