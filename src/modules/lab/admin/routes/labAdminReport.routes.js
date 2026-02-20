import { Router } from "express";
import * as controller from "../controllers/labAdminReport.controller.js";
 
const router = Router();
 
/**
 * @swagger
 * tags:
 *   - name: Lab Admin Reports
 *     description: Lab admin report upload APIs
 */

/**
 * @swagger
 * /api/lab-admin/reports/upload:
 *   post:
 *     summary: Upload lab report
 *     description: Upload PDF reports and mark booking as COMPLETED
 *     tags: [Lab Admin Reports]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labBookingId
 *               - reportUrls
 *             properties:
 *               labBookingId:
 *                 type: integer
 *                 example: 3
 *               reportUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - https://cdn.lab.com/report1.pdf
 *                   - https://cdn.lab.com/report2.pdf
 *               summary:
 *                 type: string
 *                 example: All parameters are within normal range
 *               reportStatus:
 *                 type: string
 *                 enum: [NORMAL, BORDERLINE, ABNORMAL]
 *                 example: NORMAL
 *
 *     responses:
 *       200:
 *         description: Report uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Report uploaded & booking marked COMPLETED
 *               report:
 *                 id: 13
 *                 labBookingId: 3
 *                 reportStatus: NORMAL
 *
 *       400:
 *         description: Missing required fields
 *
 *       500:
 *         description: Server error
 */
router.post("/reports/upload", controller.uploadLabReport);
 
export default router;