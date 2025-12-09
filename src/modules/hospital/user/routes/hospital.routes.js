import express from "express";
import { listHospitalsByMode, listHospitalsByCategory } from "../controllers/hospital.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();
/**
 * @swagger
 * /api/hospital/user/hospitals-by-mode:
 *   post:
 *     summary: List hospitals by consultation mode (ONLINE / OFFLINE / BOTH)
 *     tags: [Hospitals]
 *     description: Returns hospitals near the user's location based on selected consultation mode.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mode
 *               - latitude
 *               - longitude
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, BOTH]
 *                 default: ONLINE
 *               latitude:
 *                 type: number
 *                 example: 17.385044
 *               longitude:
 *                 type: number
 *                 example: 78.486671
 *               page:
 *                 type: integer
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 default: 20
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cached:
 *                   type: boolean
 *                   example: false
 *                 mode:
 *                   type: string
 *                   example: ONLINE
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 count:
 *                   type: integer
 *                   example: 20
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: number, example: 1 }
 *                       name: { type: string, example: "Apollo Hospital" }
 *                       imageUrl: { type: string, nullable: true, example: "https://example.com/hospital.jpg" }
 *                       speciality: { type: string, example: "Cardiology" }
 *                       location: { type: string, example: "Hyderabad" }
 *                       place: { type: string, example: "Secunderabad" }
 *                       latitude: { type: number, example: 17.432 }
 *                       longitude: { type: number, example: 78.389 }
 *                       distance: { type: number, example: 2.4 }
 *                       isOpen: { type: boolean, example: true }
 *
 *       400:
 *         description: Invalid input (e.g., wrong mode or missing lat/long)
 *       500:
 *         description: Internal server error
 */

router.post("/hospitals-by-mode", nearbyLimiter, listHospitalsByMode);


/**
 * @swagger
 * /api/hospital/user/hospitals-by-category:
 *   post:
 *     summary: List hospitals by category and consultation mode
 *     tags: [Hospitals]
 *     description: Returns nearby hospitals filtered by category ID and consultation mode.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - mode
 *               - latitude
 *               - longitude
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 example: 3
 *               mode:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE]
 *                 default: ONLINE
 *               latitude:
 *                 type: number
 *                 example: 17.385044
 *               longitude:
 *                 type: number
 *                 example: 78.486671
 *               page:
 *                 type: integer
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 default: 20
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cached:
 *                   type: boolean
 *                   example: false
 *                 categoryId:
 *                   type: integer
 *                   example: 3
 *                 mode:
 *                   type: string
 *                   example: ONLINE
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
 *                     properties:
 *                       id: { type: number, example: 2 }
 *                       name: { type: string, example: "Yashoda Hospital" }
 *                       imageUrl: { type: string, example: "https://example.com/hospital2.jpg" }
 *                       speciality: { type: string, example: "Dermatology" }
 *                       location: { type: string, example: "Hyderabad" }
 *                       place: { type: string, example: "Kukatpally" }
 *                       latitude: { type: number, example: 17.493 }
 *                       longitude: { type: number, example: 78.389 }
 *                       distance: { type: number, example: 1.2 }
 *                       isOpen: { type: boolean, example: true }
 *
 *       400:
 *         description: Missing or invalid categoryId / mode / coordinates
 *       500:
 *         description: Internal server error
 */

router.post("/hospitals-by-category", nearbyLimiter, listHospitalsByCategory);

export default router;
