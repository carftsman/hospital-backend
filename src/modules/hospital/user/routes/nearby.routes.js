// src/modules/user/routes/nearby.routes.js
import express from "express";
import { listNearbyHospitals } from "../controllers/nearby.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";


const router = express.Router();

// Rate-limit to prevent abuse
/**
 * @swagger
 * /api/hospital/user/nearby-hospitals:
 *   post:
 *     summary: Get nearby hospitals based on user's location
 *     tags: [Hospitals]
 *     description: "Returns a list of hospitals within a specified radius around the given latitude and longitude."
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 description: "User's latitude"
 *                 example: 17.385044
 *
 *               longitude:
 *                 type: number
 *                 description: "User's longitude"
 *                 example: 78.486671
 *
 *               radiusKm:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 50
 *                 default: 10
 *                 description: "Search radius in kilometers (default: 10, range: 0.5–50)"
 *
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: "Page number for pagination"
 *
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 20
 *                 description: "Items per page"
 *
 *               onlyOpen:
 *                 type: boolean
 *                 default: false
 *                 description: "Return only currently open hospitals if true"
 *
 *     responses:
 *       200:
 *         description: "Nearby hospitals retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cached:
 *                   type: boolean
 *                   example: false
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 total:
 *                   type: integer
 *                   example: 40
 *                 count:
 *                   type: integer
 *                   example: 20
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     example:
 *                       id: 10
 *                       name: "Apollo Hospital"
 *                       imageUrl: "https://example.com/hospital.jpg"
 *                       location: "Hyderabad"
 *                       place: "Kukatpally"
 *                       speciality: "Cardiology"
 *                       consultationMode: "BOTH"
 *                       supportsOnline: true
 *                       supportsOffline: true
 *                       latitude: 17.3920
 *                       longitude: 78.4862
 *                       isOpen: true
 *                       distance: 2.5
 *
 *       400:
 *         description: "Invalid latitude or longitude"
 *       500:
 *         description: "Internal server error"
 */

router.post("/nearby-hospitals", nearbyLimiter, listNearbyHospitals);

export default router;
