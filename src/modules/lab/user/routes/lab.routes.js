import { Router } from "express";
import labCartRoutes from "./labCart.routes.js";
import * as controller from "../controllers/lab.controller.js";

const router = Router();

// 🔥 MUST BE FIRST
router.use("/cart", labCartRoutes);
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
 * /api/labs/global-search:
 *   get:
 *     summary: Global search for labs, categories, and lab tests with filters
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           example: blood
 *       - in: query
 *         name: labId
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *           example: 2
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *           example: 10001
 *     responses:
 *       200:
 *         description: Global search results
 */
router.get("/global-search", controller.globalSearchLabs);
/**
 * @swagger
 * /api/labs/auto-suggest:
 *   get:
 *     summary: Auto-suggest while typing (Labs, Categories, Tests)
 *     description: Returns lightweight suggestions for search-as-you-type
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           example: ap
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Auto-suggest results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                 tests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *       400:
 *         description: query is required
 */
router.get("/auto-suggest", controller.autoSuggestLabs);






/**
 * @swagger
 * /api/labs/packages/by-age:
 *   get:
 *     summary: Get lab packages based on user age
 *     description: Used for Age-based package selection screen
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: age
 *         required: true
 *         schema:
 *           type: integer
 *           example: 25
 *       - in: query
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Age-based lab packages
 *       400:
 *         description: age and labId are required
 */
router.get("/packages/by-age", controller.getPackagesByAge);



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
 *     summary: Get lab reports for a user (Reports List screen)
 *     description: >
 *       Fetch lab reports for a user with optional filters.
 *       Use '*' to fetch all reports without filtering.
 *     tags: [Lab Reports]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *         description: Logged-in user ID
 *
 *       - in: query
 *         name: reportStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["*", "NORMAL", "ABNORMAL", "BORDERLINE"]
 *           example: "*"
 *         description: Filter by report status or use '*' for all
 *
 *       - in: query
 *         name: bookingStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["*", "PENDING", "COMPLETED", "CANCELLED"]
 *           example: "*"
 *         description: Filter by booking status or use '*' for all
 *
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-02-01"
 *         description: Start date (YYYY-MM-DD)
 *
 *       - in: query
 *         name: toDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-02-07"
 *         description: End date (YYYY-MM-DD)
 *
 *     responses:
 *       200:
 *         description: List of lab reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reportId:
 *                         type: integer
 *                         example: 4
 *                       bookingId:
 *                         type: integer
 *                         example: 4
 *                       reportStatus:
 *                         type: string
 *                         example: NORMAL
 *                       bookingStatus:
 *                         type: string
 *                         example: COMPLETED
 *                       testName:
 *                         type: string
 *                         example: CBC
 *                       labName:
 *                         type: string
 *                         example: Apollo Diagnostics
 *                       bookedDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-02-07T10:27:22.576Z
 *
 *       400:
 *         description: userId is required
 *
 *       500:
 *         description: Internal server error
 */
router.get("/reports", controller.getUserLabReports);

 
/**
 * @swagger
 * /api/labs/reports/{bookingId}/details:
 *   get:
 *     summary: Get detailed lab report by booking ID
 *     tags: [Lab Reports]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Lab report details
 *       404:
 *         description: Report not found
 */
router.get(
  "/reports/:bookingId/details",
  controller.getLabReportDetails
);


/**
 * @swagger
 * /api/labs/{labId}/packages/recommended:
 *   get:
 *     summary: Get recommended lab package based on age
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: age
 *         required: true
 *         schema:
 *           type: integer
 *           example: 34
 *     responses:
 *       200:
 *         description: Recommended lab package
 */
router.get(
  "/:labId/packages/recommended",
  controller.getRecommendedPackageByAge
);

 
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
 * /api/labs/bookings/past:
 *   get:
 *     summary: Get past lab bookings for a user
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
 *         description: Past lab bookings
 */
router.get("/bookings/past", controller.getUserPastLabBookings);

/**
 * @swagger
 * /api/labs/bookings/upcoming:
 *   get:
 *     summary: Get upcoming lab bookings for a user
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
 *         description: Upcoming lab bookings
 */
router.get("/bookings/upcoming", controller.getUserUpcomingLabBookings);

/**
 * @swagger
 * /api/labs/packages/{packageId}:
 *   get:
 *     summary: Get lab package details (Package Details screen)
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 30
 *     responses:
 *       200:
 *         description: Lab package details
 */
router.get("/packages/:packageId", controller.getLabPackageDetails);

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
 
 
export default router;