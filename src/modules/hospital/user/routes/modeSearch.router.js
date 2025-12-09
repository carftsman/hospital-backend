import express from "express";
import { modeSearch } from "../controllers/modeSearch.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

// POST because we accept location and complex payload
/**
 * @swagger
 * /api/hospital/user/modeSearch:
 *   post:
 *     summary: Search doctors, hospitals, or categories by mode and text query
 *     tags: [Search]
 *     description: "Performs a multi-entity search based on query, type, mode, and optional geolocation."
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - q
 *             properties:
 *               q:
 *                 type: string
 *                 description: "Search keyword"
 *                 example: "cardio"
 *
 *               type:
 *                 type: string
 *                 enum: [doctor, hospital, category, all]
 *                 default: all
 *                 description: "Entity type to search"
 *
 *               mode:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, BOTH]
 *                 default: BOTH
 *                 description: "Consultation mode filter"
 *
 *               latitude:
 *                 type: number
 *                 nullable: true
 *                 description: "User latitude for distance-based filtering"
 *                 example: 17.385044
 *
 *               longitude:
 *                 type: number
 *                 nullable: true
 *                 description: "User longitude for distance-based filtering"
 *                 example: 78.486671
 *
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: "Pagination page number"
 *
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 20
 *                 description: "Items per page"
 *
 *     responses:
 *       200:
 *         description: "Search results retrieved successfully"
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
 *         description: "Bad request. Missing or invalid parameters such as q, mode, or type"
 *
 *       500:
 *         description: "Internal server error"
 */

router.post("/modeSearch", nearbyLimiter, modeSearch);

export default router;
