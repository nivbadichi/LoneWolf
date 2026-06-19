import { getAllAuditLogs } from "../models/auditLogModel.js";

// GET /api/admin/audit  (Protected: Admin only)
// Returns the full activity log so an admin can see who deleted which
// event, who got banned, etc. The `adminOnly` middleware (run before this
// in the route) already guarantees only an admin's request gets here.
async function getAuditLogs(req, res, next) {
  try {
    const logs = await getAllAuditLogs();
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
}

export { getAuditLogs };
