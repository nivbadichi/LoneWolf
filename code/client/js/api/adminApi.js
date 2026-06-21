import { request } from "./http.js";

// GET /api/admin/audit - the full activity log (event deletions, user
// bans, etc). Protected: admin only.
export function getAuditLogs() {
  return request("/api/admin/audit", { auth: true });
}
