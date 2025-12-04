import * as repo from "../repositories/notification.repository.js";

export const listNotifications = async ({ hospitalId, skip = 0, take = 25, onlyUnread = false, from, to }) => {
  const where = { hospitalId: Number(hospitalId) };
  if (onlyUnread) where.read = false;
  if (from || to) where.createdAt = {};
  if (from) where.createdAt.gte = from;
  if (to) where.createdAt.lte = to;

  const [rows, count] = await Promise.all([
    repo.findNotifications({ where, skip, take }),
    repo.countNotifications({ where })
  ]);

  return { rows, count };
};

export const getNotificationById = async (id, hospitalId) => {
  const n = await repo.findNotificationById(id);
  if (!n) throw { status: 404, message: "Notification not found" };
  if (n.hospitalId !== Number(hospitalId)) throw { status: 403, message: "Not allowed" };

  // Optionally mark read automatically? We keep read/update as explicit endpoint.
  return n;
};

export const markAsRead = async (id, hospitalId) => {
  const n = await repo.findNotificationById(id);
  if (!n) throw { status: 404, message: "Notification not found" };
  if (n.hospitalId !== Number(hospitalId)) throw { status: 403, message: "Not allowed" };

  return repo.updateNotificationRead(id, true);
};
