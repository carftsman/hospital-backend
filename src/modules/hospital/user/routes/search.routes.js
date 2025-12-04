import express from "express";
import { search } from "../controllers/search.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

// POST because we accept location and complex payload
router.post("/HospitalHomesearch", nearbyLimiter, search);

export default router;
