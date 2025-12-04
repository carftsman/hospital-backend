// src/modules/user/routes/nearby.routes.js
import express from "express";
import { listNearbyHospitals } from "../controllers/nearby.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";


const router = express.Router();

// Rate-limit to prevent abuse
router.post("/nearby-hospitals", nearbyLimiter, listNearbyHospitals);

export default router;
