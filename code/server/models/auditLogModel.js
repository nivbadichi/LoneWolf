import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // A short machine-readable code for what happened, e.g. "EVENT_DELETED",
    // "USER_BANNED" — easy to filter/group on later.
    action: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // Human-readable context, e.g. the event's title or the user's email,
    // so an admin reading the log doesn't have to look the id up separately.
    details: { type: String },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

// Pure data-access: writes one log entry. Called from wherever a sensitive
// action happens (event deletion, user ban) — not tied to any one route.
async function createAuditLog({ actorId, action, targetId, details }) {
  return AuditLog.create({ actorId, action, targetId, details });
}

// Pure data-access: every log entry, newest first, with the actor's
// name/email populated so admins see "who" instead of a raw ObjectId.
async function getAllAuditLogs() {
  return AuditLog.find().sort({ createdAt: -1 }).populate("actorId", "name email");
}

export { AuditLog, createAuditLog, getAllAuditLogs };
