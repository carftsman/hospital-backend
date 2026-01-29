import express from "express";
import { getHospitalFullInfo } from "../controllers/hospitalInfo.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

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
 *     summary: Get full hospital details
 *     description: >
 *       Returns all information required to build the Hospital Details screen:
 *       - Hospital header
 *       - Location (distance optional)
 *       - Patients, Experience & Reviews
 *       - Description
 *       - Specializations
 *       - Availability timings
 *     tags:
 *       - Hospitals
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique hospital ID
 *       - in: query
 *         name: latitude
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: User latitude (optional, used to calculate distance)
 *       - in: query
 *         name: longitude
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: User longitude (optional, used to calculate distance)
 *     responses:
 *       200:
 *         description: Hospital full details
 *       400:
 *         description: Invalid hospitalId
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */

router.get(
  "/hospitals/:hospitalId/info",
  nearbyLimiter,
  getHospitalFullInfo
);

export default router;
