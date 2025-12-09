import express from "express";
import { modeSuggestions } from "../controllers/modeSuggestion.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/hospital/user/modeSuggestions:
 *   post:
 *     summary: Get search suggestions based on mode and query
 *     tags: [Search]
 *     description: "Returns autocomplete-style suggestions for doctors, hospitals, or categories depending on mode."
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
 *                 description: "Search text to generate suggestions"
 *                 example: "derma"
 *
 *               mode:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, BOTH]
 *                 default: BOTH
 *                 description: "Consultation mode filter"
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
 *         description: "Suggestions retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                   example: "derma"
 *                 mode:
 *                   type: string
 *                   example: "ONLINE"
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "Dermatology"
 *                     - "Dermatologist"
 *                     - "Skin Clinic"
 *
 *       400:
 *         description: "Invalid input such as missing or invalid query or mode"
 *
 *       500:
 *         description: "Internal server error"
 */

router.post("/modeSuggestions", modeSuggestions);

export default router;
