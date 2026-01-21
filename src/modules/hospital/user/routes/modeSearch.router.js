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
 *     summary: Search doctors, hospitals, or categories
 *     tags: [Search]
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
 *                 example: cardio
 *               type:
 *                 type: string
 *                 enum:
 *                   - doctor
 *                   - hospital
 *                   - category
 *                   - symptom
 *                   - all
 *               mode:
 *                 type: string
 *                 enum:
 *                   - ONLINE
 *                   - OFFLINE
 *                   - BOTH
 *               latitude:
 *                 type: number
 *                 nullable: true
 *               longitude:
 *                 type: number
 *                 nullable: true
 *               page:
 *                 type: integer
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Bad request
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
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum:
 *             - doctor
 *             - hospital
 *             - category
 *             - symptom
 *             - all
 *
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum:
 *             - ONLINE
 *             - OFFLINE
 *             - BOTH
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
