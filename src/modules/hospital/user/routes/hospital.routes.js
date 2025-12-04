import express from "express";
import { listHospitalsByMode, listHospitalsByCategory } from "../controllers/hospital.controller.js";
import { nearbyLimiter } from "../../../../middlewares/rateLimiters.js";

const router = express.Router();

router.post("/hospitals-by-mode", nearbyLimiter, listHospitalsByMode);
router.post("/hospitals-by-category", nearbyLimiter, listHospitalsByCategory);

export default router;
