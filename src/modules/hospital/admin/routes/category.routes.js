import express from "express";
import adminAuth from "../../../../middlewares/adminAuth.js";
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

// Protect all routes
router.use(adminAuth);

// CRUD
router.post("/", createCategory);
router.get("/", listCategories);
router.get("/:id", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
