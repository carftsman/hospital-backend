// src/modules/hospital/admin/routes/hospitalRequest.routes.js
import express from "express";
import {
  submitRequest,
  getPending,
  approve,
  reject,
} from "../controllers/hospitalRequest.controller.js";

const router = express.Router();

// 1️⃣ Hospital owner registers hospital (public)
router.post("/register", submitRequest);

// 2️⃣ Marketing team — get all pending requests
router.get("/requests/pending", getPending);

// 3️⃣ Marketing team — approve hospital
router.put("/requests/approve/:id", approve);

// 4️⃣ Marketing team — reject hospital
router.put("/requests/reject/:id", reject);

export default router;
