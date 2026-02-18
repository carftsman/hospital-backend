import express from "express";
import {
  completeMedicalProfile,
  getProfile,editProfile
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
 *               - gender
 *               - emContactName
 *               - emContactNumber
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               gender:
 *                  type: string
 *                  example: male/female/other
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





/**
 * @swagger
 * /api/hospital/user/profile/edit:
 *   patch:
 *     summary: Edit user profile
 *     description: Update any of the editable fields of the logged-in user profile. Only fields provided will be updated.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Akshay Kumar
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               email:
 *                 type: string
 *                 example: akshay@test.com
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: MALE
 *               emContactName:
 *                 type: string
 *                 example: Father
 *               emContactNumber:
 *                 type: string
 *                 example: 9999999999
 *               DateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1990-05-21
 *     responses:
 *       200:
 *         description: Profile edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile edited successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     emContactName:
 *                       type: string
 *                     emContactNumber:
 *                       type: string
 *                     DateOfBirth:
 *                       type: string
 *                       format: date
 *                       example: 1990-05-21
 */
router.patch("/edit", authenticate, editProfile);

export default router;

