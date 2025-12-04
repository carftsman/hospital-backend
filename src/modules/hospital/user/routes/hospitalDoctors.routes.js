import express from "express";
import { getHospitalDoctors } from "../controllers/hospitalDoctors.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

router.get("/hospital/:hospitalId/doctors", nearbyLimiter, getHospitalDoctors);

export default router;
