import express from "express";
import { authenticate } from "../../../../middlewares/auth.middleware.js";
import { upload } from "../../../../middlewares/upload.middleware.js";
import {
  uploadPrescription,
  getUserPrescriptions,
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
router.post("/upload",authenticate,upload.array("files", 5),uploadPrescription);

/**
 * @swagger
 * /api/lab-prescriptions/user:
 *   get:
 *     summary: Get user's uploaded prescriptions
 *     description: >
 *       Fetch all prescriptions uploaded by the authenticated user
 *       that are not yet attached to any lab booking.
 *       Prescriptions are grouped by groupId.
 *     tags:
 *       - Lab Prescriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User prescriptions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User prescriptions fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupId:
 *                         type: string
 *                         nullable: true
 *                         example: 8fdca69d-7784-49fe-859a-8942fc00cd73
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-02-12T10:00:00.000Z
 *                       files:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 12
 *                             fileUrl:
 *                               type: string
 *                               example: https://medicaldhatvi.blob.core.windows.net/labs/prescriptions/sample.jpg
 *                             fileType:
 *                               type: string
 *                               example: image/jpeg
 *                             status:
 *                               type: string
 *                               example: UPLOADED
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch prescriptions
 */
router.get("/user",authenticate,getUserPrescriptions);

/**
 * Attach prescription to lab booking
 * PATCH /api/lab-prescriptions/:id/attach-booking
 */
/**
 * @swagger
 * /api/lab-prescriptions/attach-booking:
 *   patch:
 *     summary: Send prescription group to lab
 *     description: >
 *       Attach an uploaded prescription group to a lab booking.
 *       This updates all prescriptions in the given groupId
 *       and marks them as SENT.
 *     tags:
 *       - Lab Prescriptions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - labBookingId
 *             properties:
 *               groupId:
 *                 type: string
 *                 example: 7e0886ae-01a1-4c7d-be5b-28bb89337aac
 *               labBookingId:
 *                 type: integer
 *                 example: 45
 *     responses:
 *       200:
 *         description: Prescription group attached successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Prescription group attached successfully
 *       400:
 *         description: groupId or labBookingId missing
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription group not found
 */
router.patch("/attach-booking",authenticate,attachLabBooking);

export default router;