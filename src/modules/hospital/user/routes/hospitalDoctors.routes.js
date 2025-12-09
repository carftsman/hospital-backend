import express from "express";
import { getHospitalDoctors } from "../controllers/hospitalDoctors.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();
/**
 * @swagger
 * /api/hospital/user/hospital/{hospitalId}/doctors:
 *   get:
 *     summary: Get doctors for a specific hospital
 *     tags: [Doctors]
 *     description: "Returns doctors available in a specific hospital filtered by consultation mode."
 *
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "ID of the hospital"
 *
 *       - in: query
 *         name: mode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *           default: BOTH
 *         description: "Consultation mode filter"
 *
 *       - in: query
 *         name: distance
 *         required: false
 *         schema:
 *           type: number
 *           nullable: true
 *         description: "Maximum distance filter in kilometers"
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: "Page number for pagination"
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *           default: 50
 *         description: "Maximum number of doctors per page"
 *
 *     responses:
 *       200:
 *         description: "Doctors retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cached:
 *                   type: boolean
 *                   example: false
 *                 total:
 *                   type: integer
 *                   example: 40
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     example:
 *                       id: 12
 *                       name: "Dr. Rakesh Sharma"
 *                       speciality: "Cardiology"
 *                       experience: "10 years"
 *                       imageUrl: "https://example.com/doc.jpg"
 *                       rating: 4.8
 *                       mode: "ONLINE"
 *
 *       400:
 *         description: "Invalid input such as hospitalId or mode"
 *
 *       500:
 *         description: "Internal server error"
 */

router.get("/hospital/:hospitalId/doctors", nearbyLimiter, getHospitalDoctors);

export default router;
