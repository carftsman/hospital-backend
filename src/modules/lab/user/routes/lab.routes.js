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
 *       Supports search, distance slider, rating filter, fee range filter,
 *       sorting and pagination.
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: Apollo
 *         description: Search by lab name or city
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [distance, rating, fee_low]
 *           example: distance
 *         description: Sort labs by distance, rating or lowest fee
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
 *         name: minFee
 *         schema:
 *           type: number
 *           example: 100
 *         description: Minimum consultation fee filter
 *
 *       - in: query
 *         name: maxFee
 *         schema:
 *           type: number
 *           example: 500
 *         description: Maximum consultation fee filter
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
 *             example:
 *               count: 2
 *               page: 1
 *               limit: 10
 *               labs:
 *                 - id: 1
 *                   name: Apollo Diagnostics
 *                   rating: 4.5
 *                   isOpen: true
 *                   city: Hyderabad
 *                   imageUrl: https://cdn.example.com/labs/apollo.png
 *                   consultationFee: 299
 *                   distance: 0
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
 *         required: false
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
 * tags:
 *   - name: Labs
 *     description: Lab related APIs including packages, tests and bookings
 */


 
 
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
 * tags:
 *   - name: Lab Categories
 *     description: Categories screen APIs
 */

/**
 * @swagger
 * /api/labs/categories/all:
 *   get:
 *     summary: Get all lab categories (Categories screen)
 *     description: >
 *       Returns lab categories grouped by section title.
 *       Used for Categories screen in mobile app.
 *
 *     tags: [Lab Categories]
 *
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *           example: diabetes
 *         description: Search category by name
 *
 *     responses:
 *       200:
 *         description: Grouped lab categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sectionTitle:
 *                         type: string
 *                         example: Overall Wellness & General Health
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 5
 *                             name:
 *                               type: string
 *                               example: Full Body Checkups
 *                             imageUrl:
 *                               type: string
 *                               example: https://res.cloudinary.com/sample.jpg
 *
 *       500:
 *         description: Server error
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
 *     summary: Get user lab reports
 *     description: >
 *       Returns completed lab reports for a user.
 *       Supports search, report status filtering,
 *       last 30 days filter and custom date range.
 *     tags: [Lab Reports]
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
 *         name: search
 *         schema:
 *           type: string
 *           example: Apollo
 *         description: Search by lab name, package or test name
 *
 *       - in: query
 *         name: reportStatus
 *         schema:
 *           type: string
 *           enum: [NORMAL, ABNORMAL, BORDERLINE]
 *
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [LAST_30_DAYS]
 *
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-01-01
 *
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-02-01
 *
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               count: 2
 *               reports:
 *                 - reportId: 7
 *                   bookingId: 4
 *                   labName: Apollo Diagnostics
 *                   testName: Complete Blood Count
 *                   testsCount: 5
 *                   status: NORMAL
 *                   date: 2026-02-11
 *       400:
 *         description: userId required
 */
router.get("/reports", controller.getUserLabReports);
 
/**
 * @swagger
 * /api/labs/reports/{reportId}/details:
 *   get:
 *     summary: Get detailed lab report
 *     description: Returns full report details including PDFs
 *     tags: [Lab Reports]
 *
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *
 *     responses:
 *       200:
 *         description: Detailed report
 *         content:
 *           application/json:
 *             example:
 *               reportId: 7
 *               bookingId: 4
 *               labName: Apollo Diagnostics
 *               tests:
 *                 - CBC
 *                 - Thyroid Profile
 *               collectedDate: 2026-02-01
 *               issuedDate: 2026-02-11
 *               resultSummary: All parameters normal
 *               status: NORMAL
 *               reports:
 *                 - name: Report-1
 *                   url: https://cdn.lab.com/report1.pdf
 *       404:
 *         description: Report not found
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
 * /api/labs/bookings/cancelled:
 *   get:
 *     summary: Get cancelled lab bookings
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Cancelled lab bookings
 */
 router.get("/bookings/cancelled", controller.getUserCancelledLabBookings);

/**
 * @swagger
 * /api/labs/bookings/confirm:
 *   post:
 *     summary: Confirm lab booking (Direct confirm - No HOLD)
 *     description: Creates confirmed booking directly when user clicks Pay (no payment gateway)
 *     tags: [Lab Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 1
 *             slotId: 45
 *     responses:
 *       200:
 *         description: Booking confirmed
 *         content:
 *           application/json:
 *             example:
 *               message: Booking confirmed successfully
 *               bookingIds: [101, 102]
 *               status: CONFIRMED
 */

router.post("/bookings/confirm", controller.confirmLabBooking);
/**
 * @swagger
 * /api/labs/bookings/{bookingId}:
 *   get:
 *     summary: Get lab booking details by booking ID
 *     description: Fetch single lab booking details for success screen or invoice
 *     tags: [Lab Booking]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lab booking ID
 *     responses:
 *       200:
 *         description: Booking details fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Booking Details
 *               booking:
 *                 bookingId: 8
 *                 labName: Thyrocare Lab
 *                 date: 2026-02-19
 *                 timeRange: 02:30 PM - 03:30 PM
 *                 consultationType: Lab Visit
 *                 address: Hyderabad
 *                 price: 2499
 *                 status: CONFIRMED
 *       404:
 *         description: Booking not found
 */
router.get("/bookings/:bookingId", controller.getLabBookingById); 
/**
 * @swagger
 * /api/labs/bookings/{bookingId}/invoice:
 *   get:
 *     summary: Get lab booking invoice
 *     description: Generates invoice for a confirmed lab booking
 *     tags: [Lab Booking]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lab booking ID
 *     responses:
 *       200:
 *         description: Invoice generated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Invoice generated
 *               invoice:
 *                 invoiceId: LAB-8
 *                 bookingId: 8
 *                 lab:
 *                   name: Thyrocare Lab
 *                   address: Hyderabad
 *                 patient:
 *                   name: Durga Prasad
 *                 test:
 *                   packageName: Women Wellness Package
 *                   price: 2499
 *                 slot:
 *                   date: 19 Feb 2026
 *                   time: 02:30 PM - 03:30 PM
 *                 payment:
 *                   total: 2499
 *                   paid: true
 */
router.get(
  "/bookings/:bookingId/invoice",
  controller.getLabInvoice
);

/**
 * @swagger
 * /api/labs/bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel lab booking
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lab booking cancelled
 */
router.patch("/bookings/:bookingId/cancel", controller.cancelLabBooking); 
/**
 * @swagger
 * /api/labs/bookings/{bookingId}/reschedule:
 *   put:
 *     summary: Reschedule lab booking
 *     description: >
 *       Allows user to change the slot of an existing booking.
 *       Booking must not be COMPLETED, CANCELLED, or SAMPLE_COLLECTED.
 *
 *     tags: [Labs]
 *
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 15
 *         description: Lab booking ID
 *
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *         description: User ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             newSlotId: 8
 *
 *     responses:
 *       200:
 *         description: Booking rescheduled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Booking rescheduled successfully
 *               bookingId: 15
 *               newSlot:
 *                 slotId: 8
 *                 date: 2026-03-08
 *
 *       400:
 *         description: Invalid request
 *
 *       404:
 *         description: Booking or slot not found
 *
 *       500:
 *         description: Server error
 */
router.put(
  "/bookings/:bookingId/reschedule",
  controller.rescheduleLabBooking
);
/**
 * @swagger
 * /api/labs/bookings/{bookingId}/rebook:
 *   post:
 *     summary: Rebook a previous lab test
 *     description: >
 *       Creates a new booking using details from a previous booking.
 *       User must select a new slot.
 *
 *     tags: [Labs]
 *
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 15
 *         description: Previous booking ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 2
 *             slotId: 10
 *
 *     responses:
 *       200:
 *         description: Rebooking successful
 *         content:
 *           application/json:
 *             example:
 *               message: Rebooking successful
 *               booking:
 *                 newBookingId: 32
 *                 previousBookingId: 15
 *                 labName: Apollo Diagnostics
 *                 packageName: Full Body Checkup
 *                 newSlotDate: 2026-03-10
 *
 *       400:
 *         description: Invalid request
 *
 *       404:
 *         description: Previous booking not found
 *
 *       500:
 *         description: Server error
 */
router.post(
  "/bookings/:bookingId/rebook",
  controller.rebookLabBooking
);
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
/**
 * @swagger
 * tags:
 *   - name: Lab Feedback
 *     description: Submit and check lab feedback status
 */

/**
 * @swagger
 * /api/labs/feedback/{bookingId}:
 *   get:
 *     summary: Check feedback status for a lab booking
 *     description: >
 *       Returns whether feedback has already been submitted for a booking.
 *       Used to prevent duplicate feedback submission in the app.
 *       Ideal for "Rate Your Experience" screen.
 *
 *     tags: [Lab Feedback]
 *
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *         description: Lab booking ID
 *
 *     responses:
 *       200:
 *         description: Feedback status fetched
 *         content:
 *           application/json:
 *             example:
 *               hasFeedback: true
 *               feedback:
 *                 id: 5
 *                 bookingId: 21
 *                 rating: 4
 *                 comment: Reports were delivered on time
 *                 createdAt: 2026-02-20T07:45:22.000Z
 *
 *       404:
 *         description: Booking not found
 *
 *       500:
 *         description: Server error
 */
router.get("/feedback/:bookingId", controller.checkFeedbackStatus);
/**
 * @swagger
 * /api/labs/{labId}/packages/filter:
 *   get:
 *     summary: Filter lab packages
 *     description: >
 *       Returns filtered lab packages based on price range,
 *       age range, gender preference and sorting option.
 *       Used in the Filters bottom sheet of Packages screen.
 *
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
 *         required: false
 *         schema:
 *           type: number
 *           example: 500
 *         description: Minimum package price
 *
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         schema:
 *           type: number
 *           example: 3000
 *         description: Maximum package price
 *
 *       - in: query
 *         name: minAge
 *         required: false
 *         schema:
 *           type: number
 *           example: 20
 *         description: Minimum age supported by package
 *
 *       - in: query
 *         name: maxAge
 *         required: false
 *         schema:
 *           type: number
 *           example: 60
 *         description: Maximum age supported by package
 *
 *       - in: query
 *         name: gender
 *         required: false
 *         schema:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER, ALL]
 *           example: MALE
 *         description: Gender-specific packages
 *
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [price_low, price_high]
 *           example: price_low
 *         description: Sort packages by price
 *
 *     responses:
 *       200:
 *         description: Successfully fetched filtered packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 packages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       packageId:
 *                         type: integer
 *                         example: 1
 *                       packageName:
 *                         type: string
 *                         example: Prime Full Body Checkup
 *                       originalPrice:
 *                         type: number
 *                         example: 3000
 *                       finalPrice:
 *                         type: number
 *                         example: 1999
 *                       discountPercent:
 *                         type: number
 *                         example: 33
 *                       testsCount:
 *                         type: number
 *                         example: 12
 *                       reportTime:
 *                         type: string
 *                         example: 24 Hours
 *                       gender:
 *                         type: string
 *                         enum: [MALE, FEMALE, OTHER, ALL]
 *                         example: ALL
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
 * tags:
 *   - name: Recent Views
 *     description: Recently viewed lab packages
 */

/**
 * @swagger
 * /api/labs/recent-view:
 *   post:
 *     summary: Save recent viewed package
 *     tags: [Recent Views]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 1
 *             labId: 2
 *             packageId: 5
 *     responses:
 *       200:
 *         description: Saved
 */


router.post("/recent-view", controller.addRecentView);
/**
 * @swagger
 * /api/labs/recent-view:
 *   get:
 *     summary: Get recently viewed packages
 *     tags: [Recent Views]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: List
 */
router.get("/recent-view", controller.getRecentViews);
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
export default router;