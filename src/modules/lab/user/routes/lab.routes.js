import { Router } from "express";
import * as controller from "../controllers/lab.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Labs
 *   description: Diagnostic labs – screen-wise APIs (Search, Slots, Booking, Reports)
 */

/**
 * @swagger
 * /api/labs/nearby:
 *   get:
 *     summary: Get nearby labs (Labs List screen)
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
 */
router.get("/nearby", controller.getNearbyLabs);

/**
 * @swagger
 * /api/labs/search:
 *   get:
 *     summary: Search labs by name or city (Search screen)
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           example: Apollo
 *     responses:
 *       200:
 *         description: Matching labs
 */
router.get("/search", controller.searchLabs);

/**
 * @swagger
 * /api/labs/categories/all:
 *   get:
 *     summary: Get all lab categories (Categories screen)
 *     tags: [Labs]
 *     responses:
 *       200:
 *         description: List of lab categories
 */
router.get("/categories/all", controller.getLabCategories);




/**
 * @swagger
 * /api/labs/reports:
 *   get:
 *     summary: Get all lab reports for a user (Reports List screen)
 *     tags: [Lab Reports]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *     responses:
 *       200:
 *         description: List of lab reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 5
 *                   reportUrl:
 *                     type: string
 *                     example: https://cdn.example.com/report.pdf
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   labBooking:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       status:
 *                         type: string
 *                         example: COMPLETED
 *                       labTest:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: CBC
 *                           price:
 *                             type: integer
 *                             example: 400
 *                           lab:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: Apollo Diagnostics
 *       400:
 *         description: userId is required
 *       500:
 *         description: Internal server error
 */
router.get("/reports", controller.getUserLabReports);

/**
 * @swagger
 * /api/labs/reports/{bookingId}:
 *   get:
 *     summary: Get lab report by booking ID
 *     tags: [Lab Reports]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Lab report details
 *       404:
 *         description: Report not found
 */
router.get("/reports/:bookingId", controller.getLabReportByBooking);
/**
 * @swagger
 * /api/labs/reports:
 *   get:
 *     summary: Get all lab reports for a user
 *     tags: [Lab Reports]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *     responses:
 *       200:
 *         description: List of lab reports
 *       400:
 *         description: userId is required
 */
router.get("/reports", controller.getMyLabReports);

/**
 * @swagger
 * /api/labs/{labId}/categories:
 *   get:
 *     summary: Get categories inside a lab (Packages category screen)
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
 *         description: Categories for a lab
 */
router.get("/:labId/categories", controller.getCategoriesByLab);


/**
 * @swagger
 * /api/labs/{labId}/tests/search:
 *   get:
 *     summary: Search tests/packages inside a lab
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           example: Blood
 *     responses:
 *       200:
 *         description: Matching lab tests
 */
router.get("/:labId/tests/search", controller.searchLabTests);

/**
 * @swagger
 * /api/labs/{labId}/tests:
 *   get:
 *     summary: Get lab tests/packages (Packages list screen)
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
 * /api/labs/{labId}/slots:
 *   get:
 *     summary: Get available lab slots for a date (Select Slot screen)
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-02-10"
 *     responses:
 *       200:
 *         description: Available lab slots
 */
router.get("/:labId/slots", controller.getLabSlots);

/**
 * @swagger
 * /api/labs/tests/{labTestId}:
 *   get:
 *     summary: Get single lab test details (Package details screen)
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: labTestId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Lab test details
 *       404:
 *         description: Test not found
 */
router.get("/tests/:labTestId", controller.getLabTestById);

/**
 * @swagger
 * /api/labs/{labId}:
 *   get:
 *     summary: Get lab details by ID (Lab Details screen)
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
 *       404:
 *         description: Lab not found
 */
router.get("/:labId", controller.getLabById);


/**
 * @swagger
 * /api/labs/book:
 *   post:
 *     summary: Book a lab test (Book Test screen)
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
 *                 example: 5
 *               sampleDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Lab booking created
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
 */
router.post("/bookings/:bookingId/cancel", controller.cancelLabBooking);

/**
 * @swagger
 * /api/labs/bookings:
 *   get:
 *     summary: Get lab bookings by user (My Bookings screen)
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

export default router;
