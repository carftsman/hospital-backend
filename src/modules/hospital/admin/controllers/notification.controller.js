import * as service from "../services/notification.service.js";

export const listNotifications = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 25, 200);
    const skip = (page - 1) * limit;

    const onlyUnread = req.query.onlyUnread === "true";
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;

    const result = await service.listNotifications({
      hospitalId: Number(hospitalId),
      skip,
      take: limit,
      onlyUnread,
      from,
      to
    });

    return res.json({ page, limit, data: result.rows, total: result.count });
  } catch (err) {
    console.error("listNotifications error:", err);
    return res.status(err.status || 500).json({ message: err.message || "Server Error" });
  }
};

export const getNotification = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const id = Number(req.params.id);

    const notification = await service.getNotificationById(id, Number(hospitalId));

    return res.json({ data: notification });
  } catch (err) {
    if (err?.status) return res.status(err.status).json({ message: err.message });
    console.error("getNotification error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const id = Number(req.params.id);

    const updated = await service.markAsRead(id, Number(hospitalId));

    return res.json({ message: "Notification updated", data: updated });
  } catch (err) {
    if (err?.status) return res.status(err.status).json({ message: err.message });
    console.error("markNotificationRead error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
