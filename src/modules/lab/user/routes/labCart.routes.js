import { Router } from "express";
import * as controller from "../controllers/lab.cart.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lab Cart
 *   description: Lab package cart APIs
 */

/**
 * @swagger
 * /api/labs/cart:
 *   post:
 *     summary: Add package to lab cart
 *     description: Adds a package or increments quantity if already exists
 *     tags: [Lab Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 21
 *             labId: 2
 *             packageId: 5
 *     responses:
 *       200:
 *         description: Package added
 *         content:
 *           application/json:
 *             example:
 *               message: Package added to cart
 *               item:
 *                 id: 12
 *                 labId: 2
 *                 packageId: 5
 *                 name: Prime Full Body Checkup
 *                 price: 999
 *                 quantity: 1
 *                 testsCount: 12
 *                 tests: ["CBC", "LFT", "KFT"]
 */
router.post("/", controller.addToLabCart);

/**
 * @swagger
 * /api/labs/cart:
 *   get:
 *     summary: Get lab cart
 *     description: Returns cart with package tests count and names
 *     tags: [Lab Cart]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *     responses:
 *       200:
 *         description: Cart data
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 id: 21
 *                 fullName: Vicky
 *                 phone: "9000000012"
 *               lab:
 *                 id: 2
 *                 name: Apollo Diagnostics
 *                 city: Hyderabad
 *               count: 1
 *               items:
 *                 - id: 3
 *                   labId: 2
 *                   packageId: 5
 *                   name: Prime Full Body Checkup
 *                   price: 999
 *                   quantity: 1
 *                   testsCount: 12
 *                   tests: ["CBC", "Thyroid", "Vitamin D"]
 *               billSummary:
 *                 totalMRP: 999
 *                 discount: 100
 *                 homeCollection: 50
 *                 bookingFee: 10
 *                 platformFee: 30
 *                 totalAmount: 989
 */
router.get("/", controller.getLabCart);


/**
 * @swagger
 * /api/labs/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Lab Cart]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         example:
 *           message: Cart cleared
 */

router.delete("/clear", controller.clearLabCart);

/**
 * @swagger
 * /api/labs/cart/add-patient:
 *   post:
 *     summary: Create patient and attach to cart
 *     tags: [Lab Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - fullName
 *               - consultationType
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 21
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               age:
 *                 type: integer
 *                 example: 30
 *               gender:
 *                 type: string
 *                 example: Male
 *               phone:
 *                 type: string
 *                 example: 8383983838
 *               consultationType:
 *                 type: string
 *                 enum: [LAB_VISIT, SAMPLE_COLLECTION]
 *     responses:
 *       200:
 *         description: Patient created and attached
 */
router.post("/add-patient", controller.addPatientAndAttachToCart);
/**
 * @swagger
 * /api/labs/cart/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Lab Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Removed
 *         example:
 *           message: Removed from cart
 */

router.delete("/:id", controller.removeFromLabCart);

/**
 * @swagger
 * /api/labs/cart/checkout:
 *   post:
 *     summary: Checkout lab cart and hold slot
 *     description: >
 *       Converts cart items into bookings and holds selected slot
 *       for 10 minutes before payment confirmation.
 *     tags: [Lab Checkout]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 12
 *             slotId: 5
 *             patientProfileId: 3
 *
 *     responses:
 *       200:
 *         description: Slot held successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Slot held for 10 minutes
 *               bookingCount: 2
 *               bookingIds: [45, 46]
 *               expiresAt: "2026-02-16T12:45:00.000Z"
 *
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             example:
 *               message: userId and slotId are required
 *
 *       404:
 *         description: Slot not found
 *
 *       409:
 *         description: Slot already booked OR cart empty
 *
 *       500:
 *         description: Internal server error
 */

router.post("/checkout", controller.checkoutLabCart);
/**
 * @swagger
 * /api/labs/cart/summary:
 *   get:
 *     summary: Get booking summary before payment
 *     description: Returns UI-ready payment summary using bookingIds
 *     tags: [Lab Cart]
 *     parameters:
 *       - in: query
 *         name: bookingIds
 *         required: true
 *         schema:
 *           type: string
 *           example: 41,42
 *     responses:
 *       200:
 *         description: Booking summary fetched
 *       404:
 *         description: Bookings not found
 *       409:
 *         description: Booking expired
 */
router.get("/summary", controller.getBookingSummary);

export default router;
