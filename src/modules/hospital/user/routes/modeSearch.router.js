import express from "express";
import { modeSearch } from "../controllers/modeSearch.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search doctors, hospitals, categories and symptoms
 */

/**
 * @swagger
 * /api/hospital/user/modeSearch:
 *   post:
 *     summary: Search doctors, hospitals, or categories by mode and text query
 *     tags: [Search]
 *     description: Performs a multi-entity search using filters like type, mode and location
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModeSearchRequest'
 *
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                   example: 25
 *                 count:
 *                   type: integer
 *                   example: 20
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     example:
 *                       id: 101
 *                       name: "Dr. Ramesh"
 *                       speciality: "Cardiology"
 *                       entityType: "doctor"
 *                       distance: 3.5
 *
 *       400:
 *         description: Bad request (missing or invalid parameters)
 *       500:
 *         description: Internal server error
 */
router.post("/modeSearch", nearbyLimiter, modeSearch);

/**
 * @swagger
 * /api/hospital/user/modeSearch:
 *   get:
 *     summary: Search doctors, hospitals, or categories (GET)
 *     tags: [Search]
 *
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: cardio
 *
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/SearchTypeEnum'
 *
 *       - in: query
 *         name: mode
 *         schema:
 *           $ref: '#/components/schemas/ConsultationModeEnum'
 *
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get("/modeSearch", nearbyLimiter, modeSearch);

export default router;
