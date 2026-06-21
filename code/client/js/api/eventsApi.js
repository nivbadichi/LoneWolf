import { request } from "./http.js";

export function getAllEvents() {
  return request("/api/events");
}
