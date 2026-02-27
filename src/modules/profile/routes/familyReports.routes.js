import express from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { upload } from "../../../middlewares/upload.middleware.js";
import {
  addHealthReport,
  getHealthReportById,
  getAllHealthReports,
  removeHealthReport
} from "../controllers/familyReports.controllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health Reports
 *   description: APIs to manage health reports of family members
 */

/**
 * @swagger
 * /api/health-report:
 *   post:
 *     summary: Upload one or more health reports for a family member
 *     tags: [Health Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - familyMemberId
 *               - file
 *             properties:
 *               familyMemberId:
 *                 type: integer
 *                 description: ID of the family member
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (images or PDFs)
 *     responses:
 *       201:
 *         description: Health report(s) uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   familyMemberId:
 *                     type: integer
 *                   url:
 *                     type: string
 *                   type:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.post("/", authenticate, upload.array("file"), addHealthReport);

/**
 * @swagger
 * /api/health-report/all/{familyMemberId}:
 *   get:
 *     summary: Get all health reports for a specific family member
 *     tags: [Health Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyMemberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the family member
 *     responses:
 *       200:
 *         description: List of health reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   familyMemberId:
 *                     type: integer
 *                   url:
 *                     type: string
 *                   type:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/all/:familyMemberId", authenticate, getAllHealthReports);


/**
 * @swagger
 * /api/health-report/{id}:
 *   get:
 *     summary: Get a health report by ID
 *     tags: [Health Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Health report ID
 *     responses:
 *       200:
 *         description: Health report details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 familyMemberId:
 *                   type: integer
 *                 url:
 *                   type: string
 *                 type:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 */
router.get("/:id", authenticate, getHealthReportById);



/**
 * @swagger
 * /api/health-report/{id}:
 *   delete:
 *     summary: Delete a health report by ID
 *     tags: [Health Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Health report ID
 *     responses:
 *       200:
 *         description: Health report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Health report deleted successfully
 *       404:
 *         description: Report not found
 */
router.delete("/:id", authenticate, removeHealthReport);

export default router;