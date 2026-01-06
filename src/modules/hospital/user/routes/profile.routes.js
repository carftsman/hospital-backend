import express from "express";
import {
  completeMedicalProfile,
  getProfile
} from "../controllers/profile.controller.js";
import { authenticate } from "../../../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/hospital/user/profile/complete:
 *   post:
 *     summary: Complete medical user profile
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - bloodGroup
 *               - emContactName
 *               - emContactNumber
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               bloodGroup:
 *                 type: string
 *                 example: O+ve
 *               emContactName:
 *                 type: string
 *                 example: Mother
 *               emContactNumber:
 *                 type: string
 *                 example: 9876543210
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.post("/complete", authenticate, completeMedicalProfile);

/**
 * @swagger
 * /api/hospital/user/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get("/", authenticate, getProfile);

export default router;
