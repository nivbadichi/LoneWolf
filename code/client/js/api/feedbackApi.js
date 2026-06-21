import { request } from "./http.js";

// POST /api/events/:id/feedback - leaves a rating (+ optional comment) on
// one event. Protected on the server (needs req.user.id), so auth: true
// tells request() to attach the Bearer token.
export function submitFeedback(eventId, { rating, comment }) {
  return request(`/api/events/${eventId}/feedback`, {
    method: "POST",
    body: { rating, comment },
    auth: true,
  });
}

// GET /api/events/:id/feedback - lists every feedback entry for one event.
// Public on the server, so no auth flag here.
export function getEventFeedback(eventId) {
  return request(`/api/events/${eventId}/feedback`);
}
