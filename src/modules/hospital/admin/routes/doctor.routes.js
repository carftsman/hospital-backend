import express from "express";
import adminAuth from "../../../../middlewares/adminAuth.js";
import {
  createDoctor,
  listDoctors,
  updateDoctor,
  deleteDoctor
} from "../controllers/doctor.controller.js";

const router = express.Router();

router.use(adminAuth);

// Add doctor to a category
router.post("/category/:categoryId", createDoctor);

// List doctors under a category
router.get("/category/:categoryId", listDoctors);

// Update doctor
router.put("/:id", updateDoctor);

// Delete doctor
router.delete("/:id", deleteDoctor);

export default router;
