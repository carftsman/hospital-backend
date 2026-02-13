import { Router } from "express";
import * as controller from "../controllers/labAddress.controller.js";
import { authenticate as auth } from "../../../../middlewares/auth.middleware.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Lab Address
 *   description: Lab Address management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LabAddress:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         userId:
 *           type: integer
 *           example: 21
 *         fullName:
 *           type: string
 *           example: John Doe
 *         mobile:
 *           type: string
 *           example: "9876543210"
 *         house:
 *           type: string
 *           example: Flat 203
 *         street:
 *           type: string
 *           example: Madhapur Metro Station Road
 *         landmark:
 *           type: string
 *           example: Near Metro Station
 *         city:
 *           type: string
 *           example: Hyderabad
 *         state:
 *           type: string
 *           example: Telangana
 *         pinCode:
 *           type: string
 *           example: "500081"
 *         isDefault:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */


/**
 * @swagger
 * /api/labs/address:
 *   post:
 *     summary: Create new lab address
 *     tags: [Lab Address]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - fullName
 *               - mobile
 *               - house
 *               - street
 *               - city
 *               - state
 *               - pinCode
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 21
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               house:
 *                 type: string
 *                 example: Flat 203
 *               street:
 *                 type: string
 *                 example: Madhapur Road
 *               landmark:
 *                 type: string
 *                 example: Near Metro Station
 *               city:
 *                 type: string
 *                 example: Hyderabad
 *               state:
 *                 type: string
 *                 example: Telangana
 *               pinCode:
 *                 type: string
 *                 example: "500081"
 *     responses:
 *       200:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Address created successfully
 *                 address:
 *                   $ref: '#/components/schemas/LabAddress'
 *       400:
 *         description: Missing required fields
 */
router.post("/", controller.createAddress);


/**
 * @swagger
 * /api/labs/address:
 *   get:
 *     summary: Get user saved addresses
 *     tags: [Lab Address]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 21
 *     responses:
 *       200:
 *         description: List of saved addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabAddress'
 */
router.get("/", controller.getAddresses);


/**
 * @swagger
 * /api/labs/address/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Lab Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Address deleted successfully
 */
router.delete("/:id", controller.deleteAddress);

/**
 * @swagger
 * /api/labs/address/{id}/default:
 *   patch:
 *     summary: Set default address
 *     description: >
 *       Sets a specific address as the default address for the user.
 *       It will automatically remove default flag from other addresses.
 *
 *     tags: [Lab Address]
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 12
 *         description: Address ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 21
 *                 description: User ID who owns the address
 *
 *     responses:
 *       200:
 *         description: Default address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Default address updated
 *
 *       403:
 *         description: Unauthorized access (address does not belong to user)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 *
 *       404:
 *         description: Address not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Address not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/default", controller.setDefaultAddress);


export default router;
