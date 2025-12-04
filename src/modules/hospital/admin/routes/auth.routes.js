import express from "express";
import { loginHospitalOwner } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", loginHospitalOwner);

export default router;
