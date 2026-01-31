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
 *       and doctor name search with pagination.
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
 *           example: Cardiology
 *         description: Filter doctors by specialization (case-insensitive)
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: Rajesh
 *         description: Search doctors by name (case-insensitive)
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
 *         content:
 *           application/json:
 *             example:
 *               total: 1
 *               count: 1
 *               page: 1
 *               limit: 10
 *               data:
 *                 - id: 1
 *                   name: "Dr. Rajesh Kumar"
 *                   imageUrl: "https://example.com/doctor.jpg"
 *                   experience: 12
 *                   specialization: "Cardiology"
 *                   consultationMode: "BOTH"
 *                   rating: 4.8
 *                   category:
 *                     id: 1
 *                     name: "Cardiology"
 *                   hospital:
 *                     id: 1
 *                     name: "Apollo Hospitals"
 *                     city: "Hyderabad"
 *                     state: "Telangana"
 *                     imageUrl: "https://example.com/hospital.jpg"
 *                     rating: 4.7
 *
 *       400:
 *         description: Invalid hospitalId or query parameters
 *
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
 *     summary: Get doctors based on location and filters
 *     description: >
 *       Public API to fetch doctors based on user location with optional filters
 *       like distance, specialization, consultation fee, availability, and search.
 *       No authentication token is required.
 *     tags:
 *       - Doctors
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: float
 *         required: true
 *         description: User latitude
 *         example: 17.385044
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: float
 *         required: true
 *         description: User longitude
 *         example: 78.486671
 *       - in: query
 *         name: distance
 *         schema:
 *           type: number
 *           format: float
 *         required: false
 *         description: Maximum distance in kilometers
 *         example: 5
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by doctor name or hospital name
 *         example: rakesh
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by doctor specialization
 *         example: Cardiology
 *       - in: query
 *         name: minFee
 *         schema:
 *           type: integer
 *         required: false
 *         description: Minimum consultation fee
 *         example: 300
 *       - in: query
 *         name: maxFee
 *         schema:
 *           type: integer
 *         required: false
 *         description: Maximum consultation fee
 *         example: 1000
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *           default: BOTH
 *         required: false
 *         description: Consultation mode filter
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, ALL]
 *           default: ALL
 *         required: false
 *         description: Filter doctors based on availability
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         required: false
 *         description: Number of doctors per page
 *     responses:
 *       200:
 *         description: Doctors fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 doctors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       name:
 *                         type: string
 *                         example: Dr. Rakesh Sharma
 *                       specialization:
 *                         type: string
 *                         example: Cardiology
 *                       experience:
 *                         type: integer
 *                         example: 12
 *                       consultationFee:
 *                         type: integer
 *                         example: 600
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["English", "Hindi"]
 *                       distance:
 *                         type: number
 *                         example: 2.4
 *                       hospital:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: Demo Hospital
 *                           place:
 *                             type: string
 *                             example: Hyderabad
 *                           isOpen:
 *                             type: boolean
 *                             example: true
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
