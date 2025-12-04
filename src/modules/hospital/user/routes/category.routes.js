import express from "express";
import { listCategoriesByMode } from "../controllers/category.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

// Single endpoint for both ONLINE and OFFLINE categories
router.get("/categories", nearbyLimiter, listCategoriesByMode);

export default router;
