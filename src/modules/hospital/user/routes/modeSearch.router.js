import express from "express";
import { modeSearch } from "../controllers/modeSearch.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

// POST because we accept location and complex payload
router.post("/modeSearch", nearbyLimiter, modeSearch);

export default router;
