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
 * /api/labs/cart/clear:
 *   delete:
 *     summary: Clear entire cart for user
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
 *         description: Cart cleared successfully
 */
router.delete("/clear", controller.clearLabCart);


/**
 * @swagger
 * /api/labs/cart/checkout:
 *   post:
 *     summary: Checkout lab cart and create bookings
 *     tags: [Lab Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - patientProfileId
 *               - slotId
 *               - sampleDate
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 21
 *               patientProfileId:
 *                 type: integer
 *                 example: 5
 *               slotId:
 *                 type: integer
 *                 example: 12
 *               sampleDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-12T09:00:00Z"
 *     responses:
 *       200:
 *         description: Booking confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post("/checkout", controller.checkoutLabCart);


export default router;
