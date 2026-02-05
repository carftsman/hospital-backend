import { Router } from "express";
import * as controller from "../controllers/lab.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Labs
 *   description: Diagnostic labs, tests, bookings and reports
 */

/**
 * @swagger
 * /api/labs/nearby:
 *   get:
 *     summary: Get nearby labs
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 17.4401
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 78.3489
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           example: 5
 *     responses:
 *       200:
 *         description: Nearby labs list
 *       400:
 *         description: Invalid coordinates
 */
router.get("/nearby", controller.getNearbyLabs);

/**
 * @swagger
 * /api/labs/categories/all:
 *   get:
 *     summary: Get all lab categories
 *     tags: [Labs]
 *     responses:
 *       200:
 *         description: List of lab categories
 */
router.get("/categories/all", controller.getLabCategories);

/**
 * @swagger
 * /api/labs/{labId}/categories:
 *   get:
 *     summary: Get categories for a specific lab
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Categories for lab
 *       404:
 *         description: Lab not found
 */
router.get("/:labId/categories", controller.getCategoriesByLab);

/**
 * @swagger
 * /api/labs/{labId}/tests:
 *   get:
 *     summary: Get tests for a lab
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         description: Lab tests list
 */
router.get("/:labId/tests", controller.getLabTests);

/**
 * @swagger
 * /api/labs/bookings:
 *   get:
 *     summary: Get lab bookings by userId
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *     responses:
 *       200:
 *         description: List of lab bookings
 */
router.get("/bookings", controller.getUserLabBookings);

/**
 * @swagger
 * /api/labs/book:
 *   post:
 *     summary: Book a lab test (NO AUTH)
 *     tags: [Labs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - labId
 *               - labTestId
 *               - sampleDate
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 21
 *               labId:
 *                 type: integer
 *                 example: 1
 *               labTestId:
 *                 type: integer
 *                 example: 3
 *               sampleDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Lab booking created
 *       400:
 *         description: Missing fields
 */
router.post("/book", controller.bookLabTest);





/**
 * @swagger
 * /api/labs/bookings/{bookingId}/cancel:
 *   post:
 *     summary: Cancel lab booking
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       404:
 *         description: Booking not found
 */
router.post("/bookings/:bookingId/cancel", controller.cancelLabBooking);

/**
 * @swagger
 * /api/labs/{labId}:
 *   get:
 *     summary: Get lab details by ID
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lab details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Apollo Diagnostics
 *                 address:
 *                   type: string
 *                   example: Madhapur, Hyderabad
 *                 latitude:
 *                   type: number
 *                   example: 17.4401
 *                 longitude:
 *                   type: number
 *                   example: 78.3489
 *       400:
 *         description: Invalid labId
 *       404:
 *         description: Lab not found
 */
router.get("/:labId", controller.getLabById);

export default router;
