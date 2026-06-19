import * as notificationModel from "../models/notificationModel.js";

// GET /api/notifications  (Protected)
// Returns every notification belonging to the logged-in user — req.user.id
// comes from the verified JWT (set by the `protect` middleware), so a user
// can only ever see their own notifications, never anyone else's.
async function getUserNotifications(req, res, next) {
  try {
    const notifications = await notificationModel.getNotificationsByUser(req.user.id);
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/notifications/:id/read  (Protected)
// Flips one notification's `read` flag to true.
async function markAsRead(req, res, next) {
  try {
    const notification = await notificationModel.getNotificationById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ownership check: a user must only be able to mark their own
    // notifications as read, never someone else's by guessing an id.
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only mark your own notifications as read" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
}

export { getUserNotifications, markAsRead };
