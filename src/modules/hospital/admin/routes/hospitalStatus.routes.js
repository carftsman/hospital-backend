import express from "express";
import {
  getApprovedHospitals,
  getRejectedHospitals,
  getPendingHospitals
} from "../controllers/hospitalStatus.controller.js";

const router = express.Router();

router.get("/approved", getApprovedHospitals);
router.get("/rejected", getRejectedHospitals);
router.get("/pending", getPendingHospitals);

export default router;
