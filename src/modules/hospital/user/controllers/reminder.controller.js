import {
  addReminderService,
  getRemindersService,
  updateReminderService,
  updateReminderStatusService,
  deleteReminderService
} from "../services/reminder.service.js";

/* ---------------- ADD REMINDER ---------------- */
export const addReminder = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FROM AUTH

    const reminder = await addReminderService(userId, req.body);

    return res.status(201).json({
      message: "Reminder added successfully",
      data: reminder
    });

  } catch (err) {
    console.error("addReminder error:", err);
    return res.status(400).json({
      message: err.message || "Failed to add reminder"
    });
  }
};
/* ---------------- MANAGE REMINDERS ---------------- */
export const getReminders = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FROM AUTH

    const reminders = await getRemindersService(userId);

    return res.json({
      total: reminders.length,
      data: reminders
    });

  } catch (err) {
    console.error("getReminders error:", err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

/* UPDATE */
export const updateReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const reminder = await updateReminderService(userId, id, req.body);
    res.json({ message: "Reminder updated", data: reminder });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* STATUS */
export const updateReminderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    const { status } = req.body;

    const reminder = await updateReminderStatusService(userId, id, status);
    res.json({ message: "Status updated", data: reminder });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* DELETE */
export const deleteReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    await deleteReminderService(userId, id);
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};