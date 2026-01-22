import express from "express";
import {
  getHospitalDoctors,
  getDoctors,
  getDoctorInfo,
  getDoctorAvailability,
} from "../controllers/hospitalDoctors.controller.js";
import {
  listNearbyHospitals
} from "../controllers/hospital.controller.js";


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor listing, profile, and availability APIs
 */

/**
 * @swagger
 * /api/hospital/user/hospital/{hospitalId}/doctors:
 *   get:
 *     summary: Get doctors for a specific hospital
 *     tags: [Doctors]
 *     description: Returns doctors available in a hospital sorted by rating
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       400:
 *         description: Invalid hospitalId
 *       500:
 *         description: Internal server error
 */
router.get("/hospital/:hospitalId/doctors", getHospitalDoctors);

/**
 * @swagger
 * /api/hospital/user/doctors:
 *   get:
 *     summary: Get doctors (global list)
 *     tags: [Doctors]
 *     description: Returns doctors filtered by specialization and sorted by rating
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *           example: Cardiology
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Doctors fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/doctors", getDoctors);

/**
 * @swagger
 * /api/hospital/user/doctors/{doctorId}:
 *   get:
 *     summary: Get doctor profile
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Doctor profile retrieved
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */
router.get("/doctors/:doctorId", getDoctorInfo);



/**
 * @swagger
 * /api/hospital/user/hospitals/nearby/filter:
 *   get:
 *     summary: Get nearby hospitals with filters
 *     tags: [Hospitals]
 *     description: >
 *       Returns nearby hospitals filtered by category, consultation mode,
 *       open status, and distance. Results are sorted by distance.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 17.385
 *         description: User latitude
 *
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 78.4867
 *         description: User longitude
 *
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *           example: 5
 *         description: Search radius in kilometers
 *
 *       - in: query
 *         name: categoryIds
 *         required: false
 *         schema:
 *           type: string
 *           example: "1,3,5"
 *         description: Comma-separated category IDs (Cardiology, Neurology, etc.)
 *
 *       - in: query
 *         name: mode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *           default: BOTH
 *         description: Consultation mode
 *
 *       - in: query
 *         name: openNow
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Show only currently open hospitals
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           example: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *           example: 20
 *         description: Number of hospitals per page
 *
 *     responses:
 *       200:
 *         description: Nearby hospitals fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               latitude: 17.385
 *               longitude: 78.4867
 *               radiusKm: 10
 *               page: 1
 *               limit: 20
 *               total: 5
 *               count: 2
 *               data:
 *                 - id: 1
 *                   name: "AIG Hospitals"
 *                   imageUrl: "https://example.com/hospital.png"
 *                   speciality: "Cardiology"
 *                   location: "Hyderabad"
 *                   place: "Gachibowli"
 *                   latitude: 17.4399
 *                   longitude: 78.3514
 *                   isOpen: true
 *                   distance: 3.2
 *
 *       400:
 *         description: Invalid request parameters
 *
 *       500:
 *         description: Internal server error
 */

router.get("/hospitals/nearby/filter", listNearbyHospitals);




/**
 * @swagger
 * /api/hospital/user/doctors/{doctorId}/availability:
 *   get:
 *     summary: Get doctor availability by date
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 12
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-02-01
 *     responses:
 *       200:
 *         description: Availability retrieved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.get("/doctors/:doctorId/availability", getDoctorAvailability);

export default router;
