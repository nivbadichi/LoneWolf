import { request } from "./http.js";

export function getMyProfile() {
  return request("/api/users/me", { auth: true });
}
