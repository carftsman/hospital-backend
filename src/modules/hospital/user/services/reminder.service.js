import * as repo from "../repositories/reminder.repository.js";

export const addReminderService = async (userId, payload) => {
  const {
    type,
    title,
    reminderAt,
    repeat = "NONE",
    notes,
    isImportant = false
  } = payload;

  if (!type || !title || !reminderAt) {
    throw new Error("Missing required fields");
  }

  return repo.createReminder({
    userId,
    type,
    title,
    reminderAt: new Date(reminderAt),
    repeat,
    notes,
    isImportant
  });
};

export const getRemindersService = async (userId) => {
  const reminders = await repo.getUserReminders(userId);

  const now = new Date();

  return reminders.map(r => ({
    ...r,
    isUrgent: r.reminderAt <= now
  }));
};

export const updateReminderService = async (userId, id, payload) => {
  const reminder = await repo.findReminderById(id, userId);
  if (!reminder) throw new Error("Reminder not found");

  const { remindAt, ...rest } = payload;

  return repo.updateReminder(id, userId, {
    ...rest,
    ...(remindAt && { reminderAt: new Date(remindAt) })
  });
};

export const updateReminderStatusService = async (userId, id, status) => {
  const reminder = await repo.findReminderById(id, userId);
  if (!reminder) throw new Error("Reminder not found");

  return repo.updateReminder(id, userId, { status });
};

export const deleteReminderService = async (userId, id) => {
  const reminder = await repo.findReminderById(id, userId);
  if (!reminder) throw new Error("Reminder not found");

  return repo.deleteReminder(id, userId);
};