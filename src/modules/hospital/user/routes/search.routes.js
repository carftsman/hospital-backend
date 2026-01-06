import express from "express";
import { search } from "../controllers/search.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

// POST because we accept location and complex payload
/**
 * @swagger
 * /api/hospital/user/HospitalHomesearch:
 *   post:
 *     summary: Search hospitals, doctors, or categories
 *     tags: [Search]
 *     description: "Performs a general search across doctors, hospitals, and categories based on a text query and optional location."
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
 *                 enum: [doctor, hospital, category, symptom, all]
 *                 default: all
 *                 description: "Entity type to search"
 *
 *               latitude:
 *                 type: number
 *                 nullable: true
 *                 description: "User latitude for distance sorting"
 *                 example: 17.385044
 *
 *               longitude:
 *                 type: number
 *                 nullable: true
 *                 description: "User longitude for distance sorting"
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
 *                 description: "Results per page"
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
 *                   example: 45
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
 *                       id: 12
 *                       name: "Cardiology Department"
 *                       entityType: "hospital"
 *                       speciality: "Cardiology"
 *                       latitude: 17.39
 *                       longitude: 78.48
 *                       distance: 2.3
 *
 *       400:
 *         description: "Invalid or missing search query or type"
 *
 *       500:
 *         description: "Internal server error"
 */

router.post("/HospitalHomesearch", nearbyLimiter, search);

export default router;
