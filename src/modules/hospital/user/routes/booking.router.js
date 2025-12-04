import express from "express";
import { createBooking } from "../controllers/booking.controller.js";
import userAuth from "../../../../middlewares/userAuth.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

// now protected by userAuth
router.post("/bookings", userAuth, nearbyLimiter, createBooking);

export default router;
