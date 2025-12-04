import express from "express";
import adminAuth from "../../../../middlewares/adminAuth.js";
import {
  listNotifications,
  getNotification,
  markNotificationRead
} from "../controllers/notification.controller.js";

const router = express.Router();

// hospital admin only
router.use(adminAuth);

// List notifications for hospital (admin view)
router.get("/", listNotifications);

// Get single notification (includes booking + user snapshot)
router.get("/:id", getNotification);

// Mark notification as read (admin)
router.put("/:id/read", markNotificationRead);

export default router;
