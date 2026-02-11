import { Router } from "express";
import {
  getLabSlots,
  generateLab14DaySlots
} from "../controllers/labSlot.controller.js";
import * as service from "../services/labSlot.service.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lab Slots
 *   description: Lab slot management APIs
 */

/**
 * @swagger
 * /api/labs/{labId}/slots:
 *   get:
 *     summary: Get available lab slots for a date
 *     tags: [Lab Slots]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: 2026-02-10
 *     responses:
 *       200:
 *         description: Slots fetched successfully
 */
router.get("/:labId/slots", getLabSlots);


/**
 * @swagger
 * /api/labs/{labId}/slots/generate-14-days:
 *   post:
 *     summary: Generate slots for next 14 days
 *     tags: [Lab Slots]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Slots generated successfully
 */
router.post(
  "/:labId/slots/generate-14-days",
  generateLab14DaySlots
);

export default router;
