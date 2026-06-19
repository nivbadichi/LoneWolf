import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    // What kind of notification this is — lets the frontend pick an icon/style.
    type: { type: String, enum: ["reminder", "update", "alert"], default: "update" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

// Pure data-access: creates one notification for one user.
// Other modules (events, reports, admin) will call this once they need to
// alert a user about something — none of that wiring exists yet.
async function createNotification({ userId, message, type }) {
  return Notification.create({ userId, message, type });
}

// Pure data-access: every notification belonging to a user, newest first,
// so the most recent alert always shows up at the top of the list.
async function getNotificationsByUser(userId) {
  return Notification.find({ userId }).sort({ createdAt: -1 });
}

// Pure data-access: looks a notification up by its own id.
// Ownership is checked by the controller, not here, since "who's allowed to
// read this" is an authorization decision, not a data-access concern.
async function getNotificationById(notificationId) {
  return Notification.findById(notificationId);
}

export { Notification, createNotification, getNotificationsByUser, getNotificationById };
