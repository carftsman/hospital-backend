import express from "express";
import userAuth from "../../../../middlewares/userAuth.js";
import {
  listUserBookings,
  getUserBooking
} from "../controllers/userBooking.controller.js";

const router = express.Router();

router.use(userAuth);

// User order history
router.get("/listbookings", listUserBookings);

// Single booking (detailed)
router.get("/bookings/:id", getUserBooking);

export default router;
