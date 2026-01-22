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


import {
  listNearbyHospitalsByCategoryAndMode
} from "../controllers/hospital.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/hospital/user/hospitals/nearby/filter:
 *   get:
 *     summary: Get nearby hospitals by category and mode
 *     tags: [Hospitals]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *           default: BOTH
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
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
 *         description: Nearby hospitals fetched successfully
 */
router.get(
  "/hospitals/nearby/filter",
  listNearbyHospitalsByCategoryAndMode
);



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
 * /api/hospital/user/hospitals/nearby:
 *   get:
 *     summary: Get nearby hospitals
 *     tags: [Hospitals]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 17.3850
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 78.4867
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
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
 *         description: Nearby hospitals fetched successfully
 */
router.get("/hospitals/nearby", listNearbyHospitals);




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
