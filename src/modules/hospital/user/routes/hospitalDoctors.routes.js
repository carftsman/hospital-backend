import express from "express";
import { getHospitalDoctors, getDoctors, getDoctorInfo, getDoctorAvailability} from "../controllers/hospitalDoctors.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();
/**
 * @swagger
 * /api/hospital/user/hospital/{hospitalId}/doctors:
 *   get:
 *     summary: Get doctors for a specific hospital
 *     tags: [Doctors]
 *     description: >
 *       Returns doctors available in a specific hospital.
 *       Supports filtering by consultation mode, specialization,
 *       doctor name search, women-specific doctors, and symptoms.
 *
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Unique hospital ID
 *
 *       - in: query
 *         name: mode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *         description: Consultation mode filter
 *
 *       - in: query
 *         name: specialization
 *         required: false
 *         schema:
 *           type: string
 *           example: Gynecology
 *         description: Filter doctors by specialization
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: Anjali
 *         description: Search doctors by name
 *
 *       - in: query
 *         name: women
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *         description: >
 *           When true, returns only women-specific doctors.
 *           Used by Women Hospital Module.
 *
 *       - in: query
 *         name: symptomId
 *         required: false
 *         schema:
 *           type: integer
 *           example: 11
 *         description: >
 *           Filter doctors based on a specific symptom.
 *           Used for symptoms-based quick access.
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of doctors per page
 *
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       400:
 *         description: Invalid hospitalId or query parameters
 *       500:
 *         description: Internal server error
 */
router.get(
  "/hospital/:hospitalId/doctors",
  nearbyLimiter,
  getHospitalDoctors
);



/**
 * @swagger
 * /api/hospital/user/doctors:
 *   get:
 *     summary: Get doctors based on location and advanced filters
 *     description: >
 *       Public API to fetch doctors near user location with UI filters like
 *       department, experience, fee range, distance, availability, and sorting.
 *       No authentication required.
 *
 *     tags:
 *       - Doctors
 *
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         example: 17.385044
 *         description: User latitude
 *
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         example: 78.486671
 *         description: User longitude
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: rakesh
 *         description: Search doctor by name
 *
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         example: Cardiology
 *         description: Filter by specialization
 *
 *       - in: query
 *         name: women
 *         schema:
 *           type: boolean
 *           default: false
 *         example: true
 *         description: Return only women-specific doctors
 *
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *           default: BOTH
 *         description: Consultation mode filter
 *
 *       - in: query
 *         name: categoryIds
 *         schema:
 *           type: string
 *         example: "1,2,3"
 *         description: Department filter (comma-separated category IDs)
 *
 *       - in: query
 *         name: minExp
 *         schema:
 *           type: integer
 *         example: 5
 *         description: Minimum experience in years
 *
 *       - in: query
 *         name: maxFee
 *         schema:
 *           type: integer
 *         example: 1000
 *         description: Maximum consultation fee
 *
 *       - in: query
 *         name: distance
 *         schema:
 *           type: number
 *         example: 5
 *         description: Max distance in KM (2 / 5 / 10 from UI)
 *
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [today, tomorrow, now, all]
 *           default: all
 *         example: today
 *         description: Filter by slot availability
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - distance
 *             - experience_desc
 *             - fee_asc
 *             - fee_desc
 *             - rating_desc
 *             - rating_asc
 *           default: distance
 *         example: rating_desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         example: 20
 *
 *     responses:
 *       200:
 *         description: Doctors fetched successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
router.get("/doctors", nearbyLimiter, getDoctors);


/**
 * @swagger
 * /api/hospital/user/doctors/{doctorId}:
 *   get:
 *     summary: Get doctor information by ID
 *     tags:
 *       - Doctors
 *     description: >
 *       Fetch complete profile information of a doctor along with
 *       associated hospital details. This API is used for the
 *       doctor profile and booking screens.
 *
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique ID of the doctor
 *         example: 12
 *
 *     responses:
 *       200:
 *         description: Doctor details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 12
 *                 name:
 *                   type: string
 *                   example: Dr. Rakesh Sharma
 *                 imageUrl:
 *                   type: string
 *                   nullable: true
 *                   example: https://example.com/doctor.jpg
 *                 specialization:
 *                   type: string
 *                   example: Cardiology
 *                 qualification:
 *                   type: string
 *                   example: MD, DM
 *                 experience:
 *                   type: integer
 *                   example: 12
 *                 about:
 *                   type: string
 *                   nullable: true
 *                   example: Senior cardiologist with 12 years experience
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["English", "Hindi"]
 *                 consultationFee:
 *                   type: integer
 *                   example: 600
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-12-10T08:40:12.000Z"
 *                 hospital:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     name:
 *                       type: string
 *                       example: Apollo Hospital
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                       example: https://example.com/hospital.jpg
 *                     location:
 *                       type: string
 *                       example: Jubilee Hills
 *                     place:
 *                       type: string
 *                       example: Hyderabad
 *                     latitude:
 *                       type: number
 *                       format: float
 *                       example: 17.432
 *                     longitude:
 *                       type: number
 *                       format: float
 *                       example: 78.407
 *                     consultationMode:
 *                       type: string
 *                       enum: [ONLINE, OFFLINE, BOTH]
 *                       example: BOTH
 *                     isOpen:
 *                       type: boolean
 *                       example: true
 *
 *       400:
 *         description: Invalid doctorId supplied
 *
 *       404:
 *         description: Doctor not found
 *
 *       500:
 *         description: Internal server error
 */

router.get("/doctors/:doctorId", getDoctorInfo);

/**
 * @swagger
 * /api/hospital/user/doctors/{doctorId}/availability:
 *   get:
 *     summary: Get doctor availability by date
 *     tags:
 *       - Doctors
 *     description: >
 *       Returns all time slots of a doctor for a given date,
 *       including booked and available slots.
 *
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Doctor ID
 *         example: 12
 *
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for availability (YYYY-MM-DD)
 *         example: 2026-02-01
 *
 *     responses:
 *       200:
 *         description: Doctor availability fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 doctorId:
 *                   type: integer
 *                   example: 12
 *                 date:
 *                   type: string
 *                   example: 2026-02-01
 *                 totalSlots:
 *                   type: integer
 *                   example: 6
 *                 availableSlots:
 *                   type: integer
 *                   example: 4
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       startTime:
 *                         type: string
 *                         example: "10:00"
 *                       endTime:
 *                         type: string
 *                         example: "10:30"
 *                       isBooked:
 *                         type: boolean
 *                         example: false
 *
 *       400:
 *         description: Invalid doctorId or missing date
 *
 *       500:
 *         description: Internal server error
 */
router.get("/doctors/:doctorId/availability", getDoctorAvailability);

export default router;
