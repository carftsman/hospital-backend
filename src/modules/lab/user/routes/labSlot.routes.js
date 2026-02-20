import { Router } from "express";
import * as controller from "../controllers/labSlot.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Lab Slots
 *     description: Lab availability calendar and slot selection APIs (Cart locked to one lab)
 */

/* ============================================================
   1️⃣ 14-DAY AVAILABILITY CALENDAR
============================================================ */

/**
 * @swagger
 * /api/labs/{labId}/availability:
 *   get:
 *     summary: Get 14-day availability calendar
 *     description: Returns next 14 days with slot counts for selected lab
 *     tags: [Lab Slots]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Availability fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               labId: 1
 *               days:
 *                 - date: 2026-02-20
 *                   label: Today
 *                   slotsAvailable: 5
 *                 - date: 2026-02-21
 *                   label: Tomorrow
 *                   slotsAvailable: 3
 */
router.get("/:labId/availability", controller.getLabAvailability);


/* ============================================================
   2️⃣ GET SLOTS (CART LOCKED TO LAB)
============================================================ */

/**
 * @swagger
 * /api/labs/{labId}/slots:
 *   get:
 *     summary: Get available slots for selected date
 *     description: |
 *       Returns available time slots for a lab.
 *       
 *       🔒 Cart Lock Logic:
 *       - Slots are only returned if user's cart belongs to this lab
 *       - Prevents switching labs after adding to cart (Zomato-style)
 *       - Pass userId to validate cart lab
 *     tags: [Lab Slots]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-02-20
 *
 *       - in: query
 *         name: userId
 *         required: true
 *         description: Required to validate cart lab
 *         schema:
 *           type: integer
 *           example: 21
 *
 *     responses:
 *       200:
 *         description: Slots fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               labId: 1
 *               date: 2026-02-20
 *               count: 3
 *               slots:
 *                 - slotId: 5
 *                   startTime: "09:00 AM"
 *                   endTime: "10:00 AM"
 *                   time: "09:00 AM - 10:00 AM"
 *                   isBooked: false
 *
 *       400:
 *         description: Missing parameters or cart empty
 *
 *       409:
 *         description: Cart belongs to different lab
 *
 *       500:
 *         description: Internal server error
 */
router.get("/:labId/slots", controller.getLabSlots);

export default router;