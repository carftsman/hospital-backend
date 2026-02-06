import prisma from "../../../../prisma/client.js";

export const createReminder = async (data) => {
  return prisma.reminder.create({
    data
  });
};

export const getUserReminders = async (userId) => {
  return prisma.reminder.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: {
      reminderAt: "asc"
    }
  });
};
export const findRemindersByUser = (userId, filters = {}) => {
  return prisma.reminder.findMany({
    where: {
      userId,
      ...filters
    },
    orderBy: { reminderAt: "asc" }
  });
};

export const findReminderById = (id, userId) => {
  return prisma.reminder.findFirst({
    where: { id, userId }
  });
};

export const updateReminder = (id, userId, data) => {
  return prisma.reminder.updateMany({
    where: { id, userId },
    data
  });
};

export const deleteReminder = (id, userId) => {
  return prisma.reminder.deleteMany({
    where: { id, userId }
  });
};