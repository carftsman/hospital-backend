import express from "express";
import { authenticate } from "../../../../middlewares/auth.middleware.js";
import { upload } from "../../../../middlewares/upload.middleware.js";
import {
  uploadPrescription,
  attachLabBooking
} from "../controllers/labPrescription.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/lab-prescriptions/upload:
 *   post:
 *     summary: Upload lab prescription files
 *     description: >
 *       Upload one or more lab prescription images or PDFs before booking a lab.
 *       Multiple files can be uploaded in a single request.
 *       Lab booking is NOT required at this stage.
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
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: >
 *                   Prescription files (JPG, PNG, PDF).
 *                   You can upload multiple files (max 5).
 *     responses:
 *       201:
 *         description: Prescription files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Prescription files uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     groupId:
 *                       type: string
 *                       example: 8d6a9e7a-4c2b-4a4f-9f3c-9f1c88cfa123
 *                     files:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LabPrescription'
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/upload",
  authenticate,
  upload.array("files", 5), //  max 5 files
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