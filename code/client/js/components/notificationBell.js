// Builds the DOM for one notification row - same role as eventCard.js, just
// for a different list. Doesn't call the API itself: it takes an
// `onMarkRead` callback and lets the page (notificationsPage.js) decide
// what happens when a notification is clicked, keeping this component
// reusable without it needing to know about notificationsApi.js at all.

const TYPE_LABELS = {
  reminder: "Reminder",
  update: "Update",
  alert: "Alert",
};

function formatTimestamp(isoDate) {
  return new Date(isoDate).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function createNotificationItem(notification, onMarkRead) {
  const item = document.createElement("li");
  item.className = `notification-item${notification.read ? "" : " notification-item--unread"}`;

  const type = document.createElement("span");
  type.className = "notification-item__type";
  type.textContent = TYPE_LABELS[notification.type] || "Update";

  const message = document.createElement("p");
  message.className = "notification-item__message";
  message.textContent = notification.message;

  const timestamp = document.createElement("p");
  timestamp.className = "notification-item__timestamp";
  timestamp.textContent = formatTimestamp(notification.createdAt);

  item.append(type, message, timestamp);

  if (!notification.read) {
    const markReadBtn = document.createElement("button");
    markReadBtn.type = "button";
    markReadBtn.className = "notification-item__mark-read";
    markReadBtn.textContent = "Mark as read";
    markReadBtn.addEventListener("click", () => onMarkRead(notification._id, item));
    item.appendChild(markReadBtn);
  }

  return item;
}
