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
 * /api/hospital/user/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *               - email
 *               - password
 *               - confirmPassword
 *               - termsAccepted
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               termsAccepted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */


router.post("/register",validate(registerSchema), registerUser);

/**
 * @swagger
 * /api/hospital/user/auth/login:
 *   post:
 *     summary: Login user with phone/email and password
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Phone number or email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */



router.post("/login",validate(loginSchema), loginUser);

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

/**
 * @swagger
 * /api/hospital/user/auth/forgot/request:
 *   post:
 *     summary: Request OTP for password reset
 *     tags: [Forgot Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *             description: Either phone or email must be provided
 *     responses:
 *       200:
 *         description: Forgot password OTP sent
 */

router.post("/forgot/request", requestForgotPassword);

/**
 * @swagger
 * /api/hospital/user/auth/forgot/verify:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Forgot Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */

router.post("/forgot/verify", verifyForgotOtp);

/**
 * @swagger
 * /api/hospital/user/auth/forgot/reset:
 *   post:
 *     summary: Reset user password
 *     tags: [Forgot Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */

router.post("/forgot/reset", resetPassword);


export default router;
