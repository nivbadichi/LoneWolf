import { request } from "./http.js";

// POST /api/events/:id/report - flags an event for moderation. Protected:
// any logged-in user can report an event, so this just needs auth: true,
// not an admin check (the server enforces that distinction, not the client).
export function createReport(eventId, { reason }) {
  return request(`/api/events/${eventId}/report`, {
    method: "POST",
    body: { reason },
    auth: true,
  });
}

// GET /api/reports - lists every report. Protected: admin only on the
// server (adminOnly middleware). The client still must send auth: true so
// the token reaches the server at all - the client can't enforce "admin
// only" itself, it can only avoid showing this call's result to non-admins.
export function getAdminReports() {
  return request("/api/reports", { auth: true });
}

// PATCH /api/reports/:id/resolve - marks a report resolved. Protected: admin only.
export function resolveReport(reportId) {
  return request(`/api/reports/${reportId}/resolve`, {
    method: "PATCH",
    auth: true,
  });
}
