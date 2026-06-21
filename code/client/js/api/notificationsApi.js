import { request } from "./http.js";

// GET /api/notifications - lists the caller's own notifications. Protected:
// userId is taken from the JWT server-side, so this always returns "my"
// notifications, never anyone else's - no userId param to pass here.
export function getMyNotifications() {
  return request("/api/notifications", { auth: true });
}

// PATCH /api/notifications/:id/read - marks one notification read. Protected,
// with an ownership check on the server (403 if it's not your notification).
export function markNotificationRead(notificationId) {
  return request(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    auth: true,
  });
}
