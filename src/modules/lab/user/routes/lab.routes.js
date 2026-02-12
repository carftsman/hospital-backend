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
 *     summary: Get nearby labs with filters (List + Filter bottom sheet)
 *     description: >
 *       Returns nearby diagnostic labs based on user location.
 *       Supports search, sort, rating filter, distance slider and pagination.
 *     tags: [Labs]
 *
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 17.4401
 *         description: User latitude
 *
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           example: 78.3489
 *         description: User longitude
 *
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           example: 8
 *         description: Distance filter in KM (slider)
 *
 *      
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [distance, rating, popularity]
 *           example: distance
 *         description: Sort labs by distance, rating or popularity
 *
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           example: 3
 *         description: Minimum lab rating
 *
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *           example: 5
 *         description: Maximum lab rating
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of labs per page
 *
 *     responses:
 *       200:
 *         description: Filtered nearby labs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 labs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: ""
 *                       rating:
 *                         type: number
 *                         example: 4.5
 *                       isOpen:
 *                         type: boolean
 *                         example: true
 *                       distance:
 *                         type: number
 *                         example: 2.4
 *                       city:
 *                         type: string
 *                         example: Hyderabad
 *
 *       400:
 *         description: Invalid or missing coordinates
 *
 *       500:
 *         description: Internal server error
 */
 
router.get("/nearby", controller.getNearbyLabs);
/**
 * @swagger
 * /api/labs/global-search:
 *   get:
 *     summary: Global search for labs, categories, and lab tests (UI optimized)
 *     description: >
 *       Performs a global search across labs, packages (categories),
 *       and lab tests. Test results are grouped for easy UI rendering
 *       and price comparison across labs.
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
 *           example: 4
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *           example: 100
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *           example: 1000
 *     responses:
 *       200:
 *         description: Global search results
 *         content:
 *           application/json:
 *             example:
 *               labs:
 *                 - id: 1
 *                   name: Apollo Diagnostics
 *                   imageUrl: null
 *                   rating: 4.5
 *                   city: Hyderabad
 *                   isOpen: true
 *               categories:
 *                 - id: 1
 *                   name: Blood Tests
 *               tests:
 *                 - name: Fasting Blood Sugar
 *                   minPrice: 150
 *                   maxPrice: 160
 *                   labs:
 *                     - testId: 3
 *                       labId: 1
 *                       labName: Apollo Diagnostics
 *                       price: 150
 *                     - testId: 30
 *                       labId: 2
 *                       labName: Thyrocare
 *                       price: 160
 *       400:
 *         description: query is required
 *       500:
 *         description: Server error
 */
 
router.get("/global-search", controller.globalSearchLabs);
/**
 * @swagger
 * /api/labs/auto-suggest:
 *   get:
 *     summary: Auto-suggest while typing (Labs, Categories, Tests)
 *     description: >
 *       Returns lightweight suggestions for search-as-you-type.
 *       Optimized for fast UI rendering.
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
 *             example:
 *               labs:
 *                 - id: 1
 *                   name: Apollo Diagnostics
 *               categories:
 *                 - id: 1
 *                   name: Blood Tests
 *               tests:
 *                 - id: 3
 *                   name: Fasting Blood Sugar
 *                   startingPrice: 150
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
 * /api/labs/packages/{packageId}:
 *   get:
 *     summary: Get lab package details
 *     description: Returns full lab package details for the Package Details screen
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lab category ID (treated as package)
 *     responses:
 *       200:
 *         description: Lab package details
 *       400:
 *         description: packageId is required
 *       404:
 *         description: Package not found
 *       500:
 *         description: Server error
 */
 
router.get("/packages/:packageId", controller.getLabPackageDetails);
/**
 * @swagger
 * /api/labs/{labId}/packages:
 *   get:
 *     summary: Get lab packages list (search for packages in specific labs)
 *     description: Used for Packages List screen
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: Full Body
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Packages list
 */
 
router.get("/:labId/packages", controller.getLabPackages);
 
/**
 * @swagger
 * /api/labs/{labId}/packages/filter:
 *   get:
 *     summary: Filter lab packages
 *     description: >
 *       Returns filtered lab packages based on price range,
 *       age range, gender preference and sorting option.
 *       Used in the Filters bottom sheet of Packages screen.
 *     tags: [Labs]
 *
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Lab ID
 *
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           example: 100
 *         description: Minimum package price
 *
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           example: 2000
 *         description: Maximum package price
 *
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: number
 *           example: 20
 *         description: Minimum age supported by package
 *
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: number
 *           example: 40
 *         description: Maximum age supported by package
 *
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [MALE, FEMALE, ALL]
 *           example: MALE
 *         description: Gender-specific packages
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc]
 *           example: price_asc
 *         description: Sort packages by price
 *
 *     responses:
 *       200:
 *         description: Filtered lab packages
 *         content:
 *           application/json:
 *             example:
 *               count: 2
 *               packages:
 *                 - packageId: 1
 *                   packageName: Prime Full Body Checkup
 *                   originalPrice: 3000
 *                   finalPrice: 1999
 *                   discountPercent: 33
 *                   testsCount: 12
 *                   reportTime: 24 Hours
 *                   gender: ALL
 *
 *       400:
 *         description: labId is required
 *
 *       500:
 *         description: Internal server error
 */
 
 
router.get("/:labId/packages/filter", controller.filterLabPackages);
 
 
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
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Search category by name
 *     responses:
 *       200:
 *         description: List of lab categories
 */
router.get("/categories/all", controller.getLabCategories);
 
 
 
/**
 * @swagger
 * tags:
 *   - name: Lab Reports
 *     description: Lab reports list, detailed report & downloads
 */
 
/**
 * @swagger
 * /api/labs/reports:
 *   get:
 *     tags: [Lab Reports]
 *     summary: Get user lab reports (Reports List screen)
 *     description: Returns completed lab reports with filtering options.
 *
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *
 *       - in: query
 *         name: reportStatus
 *         schema:
 *           type: string
 *           enum: [NORMAL, ABNORMAL, BORDERLINE]
 *
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *
 *     responses:
 *       200:
 *         description: List of lab reports
 *         content:
 *           application/json:
 *             example:
 *               count: 2
 *               reports:
 *                 - reportId: 7
 *                   bookingId: 4
 *                   status: NORMAL
 *                   packageName: Complete Blood Count (CBC)
 *                   testName: Complete Blood Count (CBC)
 *                   labName: Apollo Diagnostics
 *                   date: 2026-02-11
 *
 *       400:
 *         description: userId is required
 *
 *       500:
 *         description: Server error
 */
 
router.get("/reports", controller.getUserLabReports);
 
/**
 * @swagger
 * /api/labs/reports/{reportId}/details:
 *   get:
 *     tags: [Lab Reports]
 *     summary: Get detailed lab report
 *     description: Returns complete lab report details.
 *
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: Lab Report ID
 *
 *     responses:
 *       200:
 *         description: Detailed lab report
 *         content:
 *           application/json:
 *             example:
 *               reportId: 7
 *               bookingId: 4
 *               packageName: Complete Blood Count (CBC)
 *               labName: Apollo Diagnostics
 *               collectedDate: 2026-02-01
 *               issuedDate: 2026-02-11
 *               samplesCollected:
 *                 - Blood Samples
 *               resultSummary: All parameters normal.
 *               reports:
 *                 - name: Report-1
 *                   url: report1.pdf
 *
 *       404:
 *         description: Lab report not found
 */
router.get("/reports/:reportId/details", controller.getLabReportDetails);
 
/**
 * @swagger
 * /api/labs/reports/last-30-days:
 *   get:
 *     tags: [Lab Reports]
 *     summary: Get last 30 days lab tests for a user
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *     responses:
 *       200:
 *         description: Last 30 days lab tests
 */
router.get("/reports/last-30-days", controller.getLast30DaysLabTests);
 
 
/**
 * @swagger
 * /api/labs/reports/{reportId}/download:
 *   get:
 *     tags: [Lab Reports]
 *     summary: Download lab report PDF
 *     description: Downloads a single lab report file.
 *
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Unique Lab Report ID
 *
 *     responses:
 *       200:
 *         description: Report file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *
 *       404:
 *         description: Report file not found
 *
 *       500:
 *         description: Server error
 */
router.get("/reports/:reportId/download", controller.downloadLabReport);
 
 
 
/**
 * @swagger
 * /api/labs/{labId}/categories:
 *   get:
 *     summary: Get Tests with lab id (Search Screen)
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
 * /api/labs/{labId}/details:
 *   get:
 *     summary: Get lab details with expandable packages
 *     description: >
 *       Returns lab basic information along with packages.
 *       Each package contains only package name and list of included test names.
 *       Used for Lab Details screen (expandable package list).
 *     tags: [Labs]
 *
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Unique Lab ID
 *
 *     responses:
 *       200:
 *         description: Lab details with package test list
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
 *                 rating:
 *                   type: number
 *                   example: 4.5
 *                 city:
 *                   type: string
 *                   example: Hyderabad
 *                 isOpen:
 *                   type: boolean
 *                   example: true
 *                 packagesIncluded:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 4
 *                       name:
 *                         type: string
 *                         example: General Checkup
 *                       tests:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example:
 *                           - Anemia
 *                           - Infections
 *                           - Inflammation
 *                           - Blood disorders
 *                           - Total Cholesterol
 *                           - HDL (good cholesterol)
 *                           - LDL (bad cholesterol)
 *                           - Triglycerides
 *                           - VLDL
 *
 *       400:
 *         description: Invalid labId
 *
 *       404:
 *         description: Lab not found
 *
 *       500:
 *         description: Server error
 */
router.get("/:labId/details", controller.getLabDetailsById);
 
 
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
 * /api/labs/tests/recent:
 *   get:
 *     summary: Get recently viewed / booked lab tests
 *     description: >
 *       Used for "Recently Viewed Tests" section on Labs Home screen.
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Recent lab tests
 *         content:
 *           application/json:
 *             example:
 *               count: 2
 *               tests:
 *                 - testId: 3
 *                   testName: Thyroid Test
 *                   price: 300
 *                   labName: Apollo Diagnostics
 *                   lastBookedOn: 2026-02-10
 */
router.get("/tests/recent", controller.getRecentLabTests);
 
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
 *                 example: 24
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
 * /api/labs/feedback:
 *   post:
 *     summary: Submit lab feedback
 *     description: >
 *       Submit user feedback for a completed lab booking.
 *       Used in "Rate your Experience" screen after report is viewed.
 *     tags: [Labs]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 21
 *                 description: Lab booking ID
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *                 description: User rating (1 to 5 stars)
 *               comment:
 *                 type: string
 *                 example: Reports were delivered on time and staff was polite
 *                 description: Optional user feedback comment
 *
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Thank you for your feedback
 *
 *       400:
 *         description: Invalid request
 *
 *       500:
 *         description: Internal server error
 */
 
router.post("/feedback", controller.submitLabFeedback);
 
 
export default router;