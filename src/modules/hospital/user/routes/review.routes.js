import { Router } from "express";
import { createReview, getDoctorReviews } from "../controllers/review.controller.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Doctor Review APIs
 */

/**
 * @swagger
 * /api/hospital/user/doctors/{doctorId}/reviews:
 *   get:
 *     summary: Get doctor reviews
 *     description: Fetch paginated reviews for a doctor
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Doctor reviews fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               doctorId: 1
 *               total: 5
 *               page: 1
 *               limit: 10
 *               reviews:
 *                 - id: 1
 *                   doctorId: 1
 *                   rating: 5
 *                   comment: Excellent doctor
 *                   userName: Akshay
 *                   userImage: https://img.com/user.jpg
 *                   createdAt: 2026-02-23T05:10:00.000Z
 */
router.get("/doctors/:doctorId/reviews", getDoctorReviews);

/**
 * @swagger
 * /api/hospital/user/reviews:
 *   post:
 *     summary: Add doctor review
 *     description: Submit rating and review for a doctor (one review per user)
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             doctorId: 1
 *             rating: 5
 *             comment: Very polite and experienced doctor
 *             userId: 7   # ✅ ADD THIS
 *     responses:
 *       201:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Review added successfully
 *               review:
 *                 id: 12
 *                 doctorId: 1
 *                 userId: 7
 *                 rating: 5
 *                 comment: Very polite doctor
 *                 userName: Surya
 *                 userImage: https://img.com/user.jpg
 *                 createdAt: 2026-02-23T05:10:00.000Z
 */
router.post("/reviews", createReview);
export default router;