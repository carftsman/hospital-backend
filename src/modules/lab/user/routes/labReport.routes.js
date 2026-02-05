import { Router } from "express";
import * as controller from "../controllers/labReport.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lab Reports
 *   description: User lab reports and downloads
 */

/**
 * @swagger
 * /api/labs/reports:
 *   get:
 *     summary: Get all lab reports for a user
 *     tags: [Lab Reports]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *     responses:
 *       200:
 *         description: List of lab reports
 *       400:
 *         description: userId is required
 */
router.get("/reports", controller.getMyLabReports);

/**
 * @swagger
 * /api/labs/reports/{bookingId}:
 *   get:
 *     summary: Get lab report by booking ID
 *     tags: [Lab Reports]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Lab report details
 *       404:
 *         description: Report not found
 */
router.get("/reports/:bookingId", controller.getLabReportByBooking);

export default router;
