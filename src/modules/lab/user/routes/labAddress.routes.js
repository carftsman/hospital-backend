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
 *     summary: Create new address
 *     tags: [Lab Address]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 12
 *             fullName: John Doe
 *             mobile: "9876543210"
 *             house: Flat 302
 *             street: Madhapur
 *             landmark: Near Metro
 *             city: Hyderabad
 *             state: Telangana
 *             pinCode: "500081"
 *     responses:
 *       200:
 *         description: Address created
 */

router.post("/", controller.createAddress);


/**
 * @swagger
 * /api/labs/address:
 *   get:
 *     summary: Get user addresses (default + saved)
 *     tags: [Lab Address]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Address list
 *         content:
 *           application/json:
 *             example:
 *               defaultAddress:
 *                 id: 5
 *                 city: Hyderabad
 *               savedAddresses:
 *                 - id: 6
 *                   city: Bangalore
 */

router.get("/", controller.getAddresses);

/**
 * @swagger
 * /api/labs/address/{id}:
 *   delete:
 *     summary: Delete address
 *     tags: [Lab Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         example:
 *           message: Address deleted successfully
 */

router.delete("/:id", controller.deleteAddress);

/**
 * @swagger
 * /api/labs/address/default/{id}:
 *   patch:
 *     summary: Set default address
 *     tags: [Lab Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 12
 *     responses:
 *       200:
 *         example:
 *           message: Default address updated
 */

router.patch("/default/:id", controller.setDefaultAddress);

/**
 * @swagger
 * /api/labs/address/{id}:
 *   patch:
 *     summary: Edit address
 *     tags: [Lab Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 12
 *             fullName: John Updated
 *             mobile: "9999999999"
 *             house: Flat 505
 *             street: Jubilee Hills
 *             landmark: Near Temple
 *             city: Hyderabad
 *             state: Telangana
 *             pinCode: "500033"
 *     responses:
 *       200:
 *         description: Address updated
 */
router.patch("/:id", controller.editAddress);



export default router;
