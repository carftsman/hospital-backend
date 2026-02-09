import express from "express";
import { authenticate } from "../../../../middlewares/auth.middleware.js";
import { upload } from "../../../../middlewares/upload.middleware.js";
import {
  uploadPrescription,
  attachLabBooking
} from "../controllers/labPrescription.controller.js";

const router = express.Router();

/**
 * Upload prescription (camera / gallery)
 * POST /api/lab-prescriptions/upload
 */
/**
 * @swagger
 * /api/lab-prescriptions/upload:
 *   post:
 *     summary: Upload lab prescription
 *     description: >
 *       Upload a lab prescription image or PDF before booking a lab.
 *       Appointment or lab booking is NOT required at this stage.
 *     tags:
 *       - Lab Prescriptions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Prescription image or PDF (jpg, png, pdf)
 *     responses:
 *       201:
 *         description: Prescription uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabPrescription'
 *       400:
 *         description: File missing or invalid
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadPrescription
);

/**
 * Attach prescription to lab booking
 * PATCH /api/lab-prescriptions/:id/attach-booking
 */
/**
 * @swagger
 * /api/lab-prescriptions/{id}/attach-booking:
 *   patch:
 *     summary: Attach prescription to lab booking
 *     description: >
 *       Attach an already uploaded prescription to a lab booking
 *       after booking confirmation.
 *     tags:
 *       - Lab Prescriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labBookingId
 *             properties:
 *               labBookingId:
 *                 type: integer
 *                 example: 45
 *     responses:
 *       200:
 *         description: Lab booking attached successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabPrescription'
 *       400:
 *         description: labBookingId missing
 *       404:
 *         description: Prescription not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id/attach-booking",
  authenticate,
  attachLabBooking
);

export default router;