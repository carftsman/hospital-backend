import { Router } from "express";
import * as controller from "../controllers/lab.cart.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lab Cart
 *   description: Lab test & booking cart APIs
 */


/**
 * @swagger
 * /api/labs/cart/add:
 *   post:
 *     summary: Add lab test to cart
 *     tags: [Lab Cart]
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
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 21
 *               labId:
 *                 type: integer
 *                 example: 1
 *               labTestId:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: Test added to cart successfully
 */
router.post("/add", controller.addToLabCart);


/**
 * @swagger
 * /api/labs/cart:
 *   get:
 *     summary: Get user lab cart with bill summary
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
 *         description: Cart details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 lab:
 *                   type: object
 *                 count:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 billSummary:
 *                   type: object
 */
router.get("/", controller.getLabCart);


/**
 * @swagger
 * /api/labs/cart/clear:
 *   delete:
 *     summary: Clear entire lab cart
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
 *         description: Cart cleared
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
 *     summary: Remove specific item from cart
 *     tags: [Lab Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Cart item removed successfully
 */
router.delete("/:id", controller.removeFromLabCart);

/**
 * @swagger
 * /api/labs/cart/checkout:
 *   post:
 *     summary: Checkout lab cart and hold selected slot
 *     description: >
 *       Creates lab bookings for all cart items and holds the selected slot
 *       for 10 minutes. If slot is already booked, returns conflict error.
 *
 *     tags: [Lab Cart]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - slotId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 21
 *               slotId:
 *                 type: integer
 *                 example: 5
 *               patientProfileId:
 *                 type: integer
 *                 example: 3
 *                 description: Optional patient profile ID
 *
 *     responses:
 *       200:
 *         description: Slot held successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Slot held for 10 minutes
 *                 bookingCount:
 *                   type: integer
 *                   example: 2
 *                 bookingIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [45, 46]
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *
 *       400:
 *         description: Missing required fields or empty cart
 *
 *       404:
 *         description: Slot not found
 *
 *       409:
 *         description: Slot already booked
 *
 *       500:
 *         description: Internal server error
 */
router.post("/checkout", controller.checkoutLabCart);

export default router;
