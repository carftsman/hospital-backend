import express from "express";
import { listCategoriesByMode } from "../controllers/category.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

/**
 * @swagger
 * /api/hospital/user/categories:
 *   get:
 *     summary: List categories by consultation mode
 *     tags: [Categories]
 *     description: "Fetch categories using query parameters. Defaults to BOTH mode."
 *     parameters:
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, BOTH]
 *         required: false
 *         description: "Consultation mode (default: BOTH)"
 *
 *       - in: query
 *         name: women
 *         schema:
 *           type: boolean
 *           example: true
 *         required: false
 *         description: "If true, returns only women-specific categories"
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: "Page number for pagination (default: 1)"
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         required: false
 *         description: "Number of categories per page (default: 20, max: 50)"
 *
 *     responses:
 *       200:
 *         description: "Categories retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mode:
 *                   type: string
 *                   example: ONLINE
 *                 women:
 *                   type: boolean
 *                   example: true
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
 *                     example:
 *                       id: 1
 *                       name: "Gynecology"
 *
 *       400:
 *         description: "Invalid mode"
 *
 *       500:
 *         description: "Internal server error"
 */

router.get("/categories", nearbyLimiter, listCategoriesByMode);

export default router;