import { request } from "./http.js";

export function getMyProfile() {
  return request("/api/users/me", { auth: true });
}

export function updateMyProfile(updates) {
  return request("/api/users/me", { method: "PATCH", body: updates, auth: true });
}
