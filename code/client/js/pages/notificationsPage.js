import { getMyNotifications, markNotificationRead } from "../api/notificationsApi.js";
import { createNotificationItem } from "../components/notificationBell.js";
import { showToast } from "../components/toast.js";
import { qs } from "../utils/dom.js";

const listEl = qs("#notifications-list");

function showMessage(text) {
  listEl.replaceChildren();
  const message = document.createElement("li");
  message.className = "page-state";
  message.textContent = text;
  listEl.appendChild(message);
}

// Marks one notification read, then updates just that row in place (rather
// than re-fetching the whole list) - removing its "Mark as read" button and
// its unread styling is enough, no need for a network round trip just to
// redraw something we already know the new state of.
async function handleMarkRead(notificationId, itemEl) {
  try {
    await markNotificationRead(notificationId);
    itemEl.classList.remove("notification-item--unread");
    qs(".notification-item__mark-read", itemEl)?.remove();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function loadNotifications() {
  showMessage("Loading notifications...");

  try {
    const result = await getMyNotifications();
    const notifications = result.data;

    if (notifications.length === 0) {
      showMessage("You're all caught up - no notifications.");
      return;
    }

    listEl.replaceChildren();
    notifications.forEach((notification) => {
      listEl.appendChild(createNotificationItem(notification, handleMarkRead));
    });
  } catch (error) {
    showMessage("Couldn't load notifications.");
    showToast(error.message, "error");
  }
}

loadNotifications();
