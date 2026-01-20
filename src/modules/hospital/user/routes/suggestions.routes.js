import express from "express";
import { hospitalHomeSuggestions } from "../controllers/suggestions.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();
/**
 * @swagger
 * /api/hospital/user/HospitalHomesuggestions:
 *   post:
 *     summary: Get search suggestions for home screen search
 *     tags: [Search]
 *     description: "Returns autocomplete-style suggestions based on the query text."
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: "Search keyword for generating suggestions"
 *                 example: "cardio"
 *
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 default: 10
 *                 description: "Maximum number of suggestions to return"
 *
 *     responses:
 *       200:
 *         description: "Suggestions fetched successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                   example: "cardio"
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "Cardiology"
 *                     - "Cardiologist"
 *                     - "Cardio Care"
 *
 *       400:
 *         description: "Invalid or missing query parameter"
 *
 *       500:
 *         description: "Internal server error"
 */



router.post("/HospitalHomesuggestions", nearbyLimiter, hospitalHomeSuggestions);


export default router;
