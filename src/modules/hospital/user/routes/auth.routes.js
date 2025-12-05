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
const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);


router.post("/forgot/request", requestForgotPassword);
router.post("/forgot/verify", verifyForgotOtp);
router.post("/forgot/reset", resetPassword);
export default router;
