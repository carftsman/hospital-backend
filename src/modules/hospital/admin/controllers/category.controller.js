// src/modules/hospital/admin/controllers/category.controller.js
import prisma from "../../../../prisma/client.js";

/* ---------------------------- INTERNAL OPTIMIZATIONS ---------------------------- */

// Prevent duplicate category creation when admin double-clicks
const categoryCreateLock = new Map();

// Cache for listCategories (DEV-friendly, expires every 30 seconds)
const categoryListCache = new Map();

/* ------------------------------------------------------------------------------- */


/**
 * Create a category for the current admin's hospital.
 * Performance-minded:
 * - Trim & validate input early to avoid wasted DB ops.
 * - Pre-check for an existing category with the same name in the same hospital
 *   to avoid duplicates and unnecessary writes.
 */
export const createCategory = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    let { name, description, imageUrl } = req.body;

    // Strong validation
    if (!name || typeof name !== "string" || !String(name).trim()) {
      return res.status(400).json({ message: "Valid category name is required" });
    }

    name = String(name).trim();

    // ----------------- IDEMPOTENCY -----------------
    const lockKey = `${hospitalId}_${name}`;
    if (categoryCreateLock.has(lockKey)) {
      return res.status(409).json({ message: "Duplicate request. Please wait." });
    }
    categoryCreateLock.set(lockKey, true);
    // -----------------------------------------------

    // PERF: check duplicate name for the same hospital (indexed lookup)
    const existing = await prisma.category.findFirst({
      where: { name, hospitalId },
      select: { id: true }
    });

    if (existing) {
      categoryCreateLock.delete(lockKey);
      return res.status(409).json({ message: "Category with this name already exists" });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        hospitalId
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        createdAt: true
      }
    });

    // Release idempotency lock
    categoryCreateLock.delete(lockKey);

    res.status(201).json({ message: "Category created", data: newCategory });
  } catch (err) {
    // Release lock on crash
    const hospitalId = req.admin?.hospitalId;
    if (hospitalId) {
      const key = `${hospitalId}_${req.body?.name}`;
      categoryCreateLock.delete(key);
    }

    res.status(500).json({ message: "Internal error", error: err.message });
  }
};



/**
 * List categories for the hospital with pagination.
 * Default page=1, limit=20.
 * PERF: prevents large full-table scans and large JSON payloads.
 */
export const listCategories = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // ------------------- CACHE -------------------
    const cacheKey = `${hospitalId}_${page}_${limit}`;
    if (categoryListCache.has(cacheKey)) {
      return res.json({
        page,
        limit,
        data: categoryListCache.get(cacheKey),
        cached: true
      });
    }
    // ---------------------------------------------

    const categories = await prisma.category.findMany({
      where: { hospitalId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        createdAt: true
      }
    });

    // Store in cache for 30 seconds
    categoryListCache.set(cacheKey, categories);
    setTimeout(() => categoryListCache.delete(cacheKey), 30000);

    res.json({ page, limit, data: categories });
  } catch (err) {
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};



/**
 * Get single category (ownership enforced by hospitalId).
 * We use findFirst with both id and hospitalId to ensure the admin can only access their categories.
 */
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.admin.hospitalId;

    const category = await prisma.category.findFirst({
      where: { id: Number(id), hospitalId },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        createdAt: true
      }
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ data: category });
  } catch (err) {
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};



/**
 * Update category (ownership + update done in single query via updateMany).
 * Using updateMany with both id and hospitalId keeps it atomic and prevents accidental cross-hospital updates.
 * Returns 404 if no rows were updated.
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.admin.hospitalId;
    const { name, description, imageUrl } = req.body;

    // Strong validation for name
    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ message: "Category name cannot be empty" });
    }

    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const updated = await prisma.category.updateMany({
      where: { id: Number(id), hospitalId },
      data
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated" });
  } catch (err) {
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};



/**
 * Delete category (ownership enforced).
 * deleteMany is used with hospitalId to make it safe in one query.
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.admin.hospitalId;

    const deleted = await prisma.category.deleteMany({
      where: { id: Number(id), hospitalId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};
