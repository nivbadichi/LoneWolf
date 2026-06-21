import { request } from "./http.js";

export function getMyProfile() {
  return request("/api/users/me", { auth: true });
}

export function updateMyProfile(updates) {
  return request("/api/users/me", { method: "PATCH", body: updates, auth: true });
}

// GET /api/users - lists every registered user. Protected: admin only.
export function getAllUsers() {
  return request("/api/users", { auth: true });
}

// PATCH /api/users/:id/suspend - bans a user. Protected: admin only.
export function suspendUser(userId) {
  return request(`/api/users/${userId}/suspend`, { method: "PATCH", auth: true });
}
