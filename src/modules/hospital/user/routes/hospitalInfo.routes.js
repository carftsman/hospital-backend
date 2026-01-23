import express from "express";
import { getHospitalFullInfo } from "../controllers/hospitalInfo.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   - name: Hospitals
//  *     description: Hospital details (single API)
//  */

// /**
//  * @swagger
//  * /api/hospital/user/hospitals/{hospitalId}/info:
//  *   get:
//  *     summary: Get full hospital details (single API for UI)
//  *     tags: [Hospitals]
//  *     description: >
//  *       Returns all information required to build the Hospital Details screen:
//  *       - Hospital header
//  *       - Location & map
//  *       - 350+ Doctors
//  *       - 15+ Years Experience
//  *       - 284+ Reviews
//  *       - About Hospital
//  *       - Specialized For
//  *     parameters:
//  *       - in: path
//  *         name: hospitalId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Unique hospital ID
//  *     responses:
//  *       200:
//  *         description: Hospital details fetched successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                   example: 1
//  *                 name:
//  *                   type: string
//  *                   example: Apollo Hospitals
//  *                 imageUrl:
//  *                   type: string
//  *                   nullable: true
//  *                 location:
//  *                   type: string
//  *                   example: Hyderabad
//  *                 place:
//  *                   type: string
//  *                   nullable: true
//  *                   example: Madhapur
//  *                 latitude:
//  *                   type: number
//  *                   example: 17.432
//  *                 longitude:
//  *                   type: number
//  *                   example: 78.389
//  *                 isOpen:
//  *                   type: boolean
//  *                   example: true
//  *
//  *                 doctorsCount:
//  *                   type: integer
//  *                   example: 350
//  *                 experienceYears:
//  *                   type: integer
//  *                   example: 15
//  *                 reviewsCount:
//  *                   type: integer
//  *                   example: 284
//  *
//  *                 about:
//  *                   type: string
//  *                   nullable: true
//  *                   example: Apollo Hospitals is a leading healthcare provider in India.
//  *
//  *                 specializedFor:
//  *                   type: array
//  *                   items:
//  *                     type: string
//  *                   example:
//  *                     - Cardiology
//  *                     - Neurology
//  *                     - Orthopedics
//  *       404:
//  *         description: Hospital not found
//  *       500:
//  *         description: Internal server error
//  */

/**
 * @swagger
 * tags:
 *   - name: Hospitals
 *     description: Hospital details (single API)
 */

/**
 * @swagger
 * /api/hospital/user/hospitals/{hospitalId}/info:
 *   get:
 *     summary: Get full hospital details (UI-ready single API)
 *     tags: [Hospitals]
 *     description: >
 *       Returns all information required to build the Hospital Details screen:
 *       - Hospital header
 *       - Location with distance
 *       - Patients, Experience & Reviews
 *       - Description
 *       - Specializations
 *       - Availability timings
 *
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique hospital ID
 *
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 17.4483
 *         description: User latitude (for distance calculation)
 *
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 78.3915
 *         description: User longitude (for distance calculation)
 *
 *     responses:
 *       200:
 *         description: Hospital details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Apollo Hospitals
 *                 imageUrl:
 *                   type: string
 *                   nullable: true
 *
 *                 location:
 *                   type: object
 *                   properties:
 *                     area:
 *                       type: string
 *                       example: Madhapur
 *                     city:
 *                       type: string
 *                       example: Hyderabad
 *                     pincode:
 *                       type: string
 *                       example: "500081"
 *
 *                 latitude:
 *                   type: number
 *                   example: 17.432
 *                 longitude:
 *                   type: number
 *                   example: 78.389
 *
 *                 distanceKm:
 *                   type: number
 *                   example: 2.3
 *
 *                 description:
 *                   type: string
 *                   example: Specialized for lung, internal diseases and high recovery rates.
 *
 *                 stats:
 *                   type: object
 *                   properties:
 *                     patients:
 *                       type: integer
 *                       example: 350
 *                     experienceYears:
 *                       type: integer
 *                       example: 15
 *                     reviews:
 *                       type: integer
 *                       example: 284
 *
 *                 specializations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - Cardiology
 *                     - Neurology
 *                     - Orthopedics
 *
 *                 availability:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     days:
 *                       type: string
 *                       example: Mon - Sat
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-22T08:30:00.000Z"
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-22T21:00:00.000Z"
 *                     isOpen:
 *                       type: boolean
 *                       example: true
 *
 *       400:
 *         description: Invalid hospitalId or missing latitude/longitude
 *
 *       404:
 *         description: Hospital not found
 *
 *       500:
 *         description: Internal server error
 */

router.get(
  "/hospitals/:hospitalId/info",
  nearbyLimiter,
  getHospitalFullInfo
);

export default router;
