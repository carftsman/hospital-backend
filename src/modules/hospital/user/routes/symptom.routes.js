import express from "express";
import { getSymptoms } from "../controllers/symptom.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/hospital/user/symptoms:
 *   get:
 *     security: []
 *     summary: Get all symptoms
 *     description: >
 *       Public API to fetch symptoms with optional search and pagination.
 *       No authentication token is required.
 *     tags:
 *       - Symptoms
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search symptoms by name (case-insensitive)
 *         example: fever
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         required: false
 *         description: Number of symptoms per page
 *     responses:
 *       200:
 *         description: Symptoms fetched successfully
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
 *                   example: 33
 *                 count:
 *                   type: integer
 *                   example: 20
 *                 symptoms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 6
 *                       name:
 *                         type: string
 *                         example: Fever
 *                       imageUrl:
 *                         type: string
 *                         example: https://example.com/symptoms/fever.png
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: General
 *       500:
 *         description: Internal server error
 */

//  PUBLIC
router.get("/symptoms", getSymptoms);

export default router;
