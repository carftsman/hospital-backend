import { Router } from "express";
import * as controller from "../controllers/lab.cart.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lab Cart
 *   description: Lab test & package cart APIs
 */

/**
 * @swagger
 * /api/labs/cart/add:
 *   post:
 *     summary: Add lab test or package to cart
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
 *         description: Added to cart successfully
 */
router.post("/add", controller.addToLabCart);

/**
 * @swagger
 * /api/labs/cart:
 *   get:
 *     summary: Get user lab cart
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
 *         description: Cart details
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
 *           example: 3
 *     responses:
 *       200:
 *         description: Cart item removed
 */
router.delete("/:id", controller.removeFromLabCart);

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
 *               - sampleDate
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 21
 *               sampleDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-10T09:00:00Z"
 *     responses:
 *       200:
 *         description: Checkout successful
 */
router.post("/checkout", controller.checkoutLabCart);

export default router;
