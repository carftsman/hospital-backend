import express from "express";
import {
  addReminder,
  getReminders,
  updateReminder,
  updateReminderStatus,
  deleteReminder
} from "../controllers/reminder.controller.js";
import { authenticate } from "../../../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/hospital/user/reminders:
 *   post:
 *     summary: Add new reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, reminderAt]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [MEDICINE, APPOINTMENT, TEST, CUSTOM]
 *               title:
 *                 type: string
 *               reminderAt:
 *                 type: string
 *                 format: date-time
 *               repeat:
 *                 type: string
 *                 enum: [NONE, DAILY, WEEKLY, MONTHLY]
 *               notes:
 *                 type: string
 *               isImportant:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Reminder added successfully
 */
router.post("/reminders", authenticate, addReminder);

/**
 * @swagger
 * /api/hospital/user/reminders:
 *   get:
 *     summary: Get all reminders
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reminders
 */
router.get("/reminders", authenticate, getReminders);

/**
 * @swagger
 * /api/hospital/user/reminders/{id}:
 *   put:
 *     summary: Update a reminder
 *     tags:
 *       - Reminders
 *     security:
 *      - bearerAuth: []
 *     description: >
 *       Update reminder details like title, reminder time, repeat option, or notes.
 *       Authentication is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reminder ID
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Take Iron Tablet
 *               remindAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-10T09:00:00.000Z"
 *               repeat:
 *                 type: string
 *                 enum: [NONE, DAILY, WEEKLY, MONTHLY]
 *                 example: DAILY
 *               notes:
 *                 type: string
 *                 example: After breakfast
 *     responses:
 *       200:
 *         description: Reminder updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Reminder updated
 *               data:
 *                 id: 12
 *                 title: Take Iron Tablet
 *                 status: ACTIVE
 *       400:
 *         description: Invalid input or reminder not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/reminders/:id", authenticate, updateReminder);

/**
 * @swagger
 * /api/hospital/user/reminders/{id}/status:
 *   patch:
 *     summary: Update reminder status
 *     tags:
 *       - Reminders
 *     security:
 *      - bearerAuth: []
 *     description: >
 *       Update reminder status (COMPLETED, SKIPPED, EXPIRED).
 *       Used when user marks reminder as done or skipped.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reminder ID
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, SKIPPED, EXPIRED]
 *                 example: COMPLETED
 *     responses:
 *       200:
 *         description: Reminder status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Status updated
 *               data:
 *                 id: 12
 *                 status: COMPLETED
 *       400:
 *         description: Invalid status or reminder not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/reminders/:id/status", authenticate, updateReminderStatus);

/**
 * @swagger
 * /api/hospital/user/reminders/{id}:
 *   delete:
 *     summary: Delete a reminder
 *     tags:
 *       - Reminders
 *     security: 
 *       - bearerAuth: []
 *     description: >
 *       Permanently delete a reminder.
 *       Authentication is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reminder ID
 *         example: 12
 *     responses:
 *       200:
 *         description: Reminder deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Reminder deleted
 *       400:
 *         description: Reminder not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete("/reminders/:id", authenticate, deleteReminder);

export default router;