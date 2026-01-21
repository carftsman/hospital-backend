import express from "express";
import {
  registerUser,
  loginUser
} from "../controllers/auth.controller.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import {
  requestForgotPassword,
  verifyForgotOtp,
  resetPassword
} from "../controllers/forgot.controller.js";
import { validate } from "../../../../middlewares/validate.js";
import {registerSchema, loginSchema} from "../validations/auth.validation.js";
const router = express.Router();

// Public

/**
 * @swagger
 * /api/hospital/user/auth/send-otp:
 *   post:
 *     summary: Send OTP to user's phone
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */

router.post("/send-otp", sendOtp);

/**
 * @swagger
 * /api/hospital/user/auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to user
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 nextStep:
 *                   type: string
 *                   enum: [HOME, PROFILE]
 */

router.post("/verify-otp", verifyOtp);




export default router;
