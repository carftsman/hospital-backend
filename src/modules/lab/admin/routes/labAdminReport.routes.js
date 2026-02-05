import { Router } from "express";
import * as controller from "../controllers/labAdminReport.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lab Admin
 *   description: Lab admin report upload APIs
 */

/**
 * @swagger
 * /api/lab-admin/reports/upload:
 *   post:
 *     summary: Upload lab report
 *     tags: [Lab Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labBookingId
 *               - reportUrl
 *             properties:
 *               labBookingId:
 *                 type: integer
 *                 example: 3
 *               reportUrl:
 *                 type: string
 *                 example: https://cdn.example.com/report.pdf
 *     responses:
 *       200:
 *         description: Report uploaded successfully
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Report already exists
 */
router.post("/reports/upload", controller.uploadLabReport);

export default router;
