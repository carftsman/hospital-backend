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
 * /api/labs/cart/summary:
 *   get:
 *     summary: Get cart summary (editable preview)
 *     description: Returns lab cart summary with patient, address, packages and bill
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
 *         description: Cart summary
 *         content:
 *           application/json:
 *             example:
 *               userId: 21
 *               consultationType: LAB_VISIT
 *               patient:
 *                 fullName: Vicky
 *                 age: 30
 *                 gender: Male
 *               address:
 *                 id: 5
 *                 city: Hyderabad
 *               lab:
 *                 id: 2
 *                 name: Apollo Diagnostics
 *               packages:
 *                 - packageId: 5
 *                   name: Prime Full Body Checkup
 *                   price: 999
 *                   tests: ["CBC", "LFT", "KFT"]
 *               billSummary:
 *                 totalMRP: 999
 *                 bookingFee: 10
 *                 platformFee: 30
 *                 homeCollection: 0
 *                 totalAmount: 1039
 */
router.get("/summary", controller.getCartSummary);

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
 * /api/labs/cart/{cartId}/add-patient:
 *   post:
 *     summary: Add patient to specific package
 *     description: Assigns a patient to a single cart package (multi-patient booking)
 *     tags: [Lab Cart]
 *
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 12
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Father
 *               age:
 *                 type: integer
 *                 example: 60
 *               gender:
 *                 type: string
 *                 example: Male
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *
 *     responses:
 *       200:
 *         description: Patient added to package
 *         content:
 *           application/json:
 *             example:
 *               message: Patient added to package
 *               patient:
 *                 id: 5
 *                 fullName: Father
 */
router.post("/:cartId/add-patient", controller.addPatientToCartItem);

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
 *           example: 12
 *     responses:
 *       200:
 *         description: Item removed
 *         content:
 *           application/json:
 *             example:
 *               message: Removed from cart
 */
router.delete("/:id", controller.removeFromLabCart);


export default router;
