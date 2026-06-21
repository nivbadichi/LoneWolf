import { request } from "./http.js";
import { API_BASE_URL } from "./config.js";

export function getAllEvents() {
  return request("/api/events");
}

// GET /api/events/:id - public, fetches one event's full details.
export function getEventById(eventId) {
  return request(`/api/events/${eventId}`);
}

// POST /api/events - publishes a new event. Protected: hostId is set
// server-side from the verified JWT, so we never send one from here.
export function createEvent({ title, category, startTime, endTime, location, capacity }) {
  return request("/api/events", {
    method: "POST",
    body: { title, category, startTime, endTime, location, capacity },
    auth: true,
  });
}

// POST /api/events/:id/join - reserves a spot for the caller. Protected.
export function joinEvent(eventId) {
  return request(`/api/events/${eventId}/join`, { method: "POST", auth: true });
}

// DELETE /api/events/:id/join - removes the caller from the participant list. Protected.
export function leaveEvent(eventId) {
  return request(`/api/events/${eventId}/join`, { method: "DELETE", auth: true });
}

// DELETE /api/events/:id - removes the event entirely. Protected: host or admin only.
export function deleteEvent(eventId) {
  return request(`/api/events/${eventId}`, { method: "DELETE", auth: true });
}

// GET /api/events/:id/calendar - not a fetch() call. This returns a direct
// download (.ics file), so the page just needs the URL to put in an <a href>,
// not JSON parsed through request().
export function getCalendarUrl(eventId) {
  return `${API_BASE_URL}/api/events/${eventId}/calendar`;
}
