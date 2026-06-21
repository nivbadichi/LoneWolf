import { getAllUsers, suspendUser } from "../api/usersApi.js";
import { getAdminReports, resolveReport } from "../api/reportsApi.js";
import { getAuditLogs } from "../api/adminApi.js";
import { isAdmin } from "../utils/auth.js";
import { showToast } from "../components/toast.js";
import { showConfirmModal } from "../components/modal.js";
import { qs } from "../utils/dom.js";

// This page's own link is already hidden from non-admins by navbar.js, but
// that only hides a link - it doesn't stop someone from typing the URL
// directly. This is the actual gate: redirect away before any admin-only
// data gets requested.
if (!isAdmin()) {
  window.location.href = "index.html";
}

function showEmptyRow(listEl, text) {
  const item = document.createElement("li");
  item.className = "page-state";
  item.textContent = text;
  listEl.appendChild(item);
}

async function loadUsers() {
  const listEl = qs("#users-list");

  try {
    const users = await getAllUsers();

    if (users.length === 0) {
      showEmptyRow(listEl, "No users found.");
      return;
    }

    listEl.replaceChildren();
    users.forEach((user) => listEl.appendChild(renderUserRow(user)));
  } catch (error) {
    showEmptyRow(listEl, "Couldn't load users.");
    showToast(error.message, "error");
  }
}

function renderUserRow(user) {
  const row = document.createElement("li");
  row.className = "admin-row";

  const info = document.createElement("div");
  const name = document.createElement("p");
  name.textContent = `${user.name} (${user.email})`;
  const role = document.createElement("span");
  role.className = `profile-card__role profile-card__role--${user.role}`;
  role.textContent = user.role;
  info.append(name, role);

  row.appendChild(info);

  if (user.isBanned) {
    const status = document.createElement("span");
    status.className = "admin-row__status";
    status.textContent = "Suspended";
    row.appendChild(status);
  } else {
    const suspendBtn = document.createElement("button");
    suspendBtn.type = "button";
    suspendBtn.className = "btn-danger";
    suspendBtn.textContent = "Suspend";
    suspendBtn.addEventListener("click", () => handleSuspend(user, row));
    row.appendChild(suspendBtn);
  }

  return row;
}

async function handleSuspend(user, rowEl) {
  const confirmed = await showConfirmModal({
    title: "Suspend this user?",
    message: `${user.name} will no longer be able to use their account.`,
    confirmLabel: "Suspend",
  });
  if (!confirmed) return;

  try {
    await suspendUser(user._id);
    showToast(`${user.name} has been suspended.`, "success");
    rowEl.replaceWith(renderUserRow({ ...user, isBanned: true }));
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function loadReports() {
  const listEl = qs("#reports-list");

  try {
    const reports = await getAdminReports();

    if (reports.length === 0) {
      showEmptyRow(listEl, "No reports found.");
      return;
    }

    listEl.replaceChildren();
    reports.forEach((report) => listEl.appendChild(renderReportRow(report)));
  } catch (error) {
    showEmptyRow(listEl, "Couldn't load reports.");
    showToast(error.message, "error");
  }
}

function renderReportRow(report) {
  const row = document.createElement("li");
  row.className = "admin-row";

  const info = document.createElement("div");
  const event = document.createElement("p");
  event.textContent = report.eventId?.title || "(event removed)";
  const reporter = document.createElement("p");
  reporter.className = "admin-row__meta";
  reporter.textContent = `Reported by ${report.reporterId?.name || "unknown"}: "${report.reason}"`;
  info.append(event, reporter);

  row.appendChild(info);

  if (report.status === "resolved") {
    const status = document.createElement("span");
    status.className = "admin-row__status";
    status.textContent = "Resolved";
    row.appendChild(status);
  } else {
    const resolveBtn = document.createElement("button");
    resolveBtn.type = "button";
    resolveBtn.textContent = "Resolve";
    resolveBtn.addEventListener("click", () => handleResolve(report, row));
    row.appendChild(resolveBtn);
  }

  return row;
}

async function handleResolve(report, rowEl) {
  try {
    await resolveReport(report._id);
    showToast("Report marked resolved.", "success");
    rowEl.replaceWith(renderReportRow({ ...report, status: "resolved" }));
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function loadAuditLogs() {
  const listEl = qs("#audit-list");

  try {
    const result = await getAuditLogs();
    const logs = result.data;

    if (logs.length === 0) {
      showEmptyRow(listEl, "No activity logged yet.");
      return;
    }

    listEl.replaceChildren();
    logs.forEach((log) => listEl.appendChild(renderAuditRow(log)));
  } catch (error) {
    showEmptyRow(listEl, "Couldn't load the audit log.");
    showToast(error.message, "error");
  }
}

function renderAuditRow(log) {
  const row = document.createElement("li");
  row.className = "admin-row";

  const info = document.createElement("div");
  const action = document.createElement("p");
  action.textContent = `${log.action} - ${log.details}`;
  const meta = document.createElement("p");
  meta.className = "admin-row__meta";
  meta.textContent = `${log.actorId?.name || "unknown"} · ${new Date(log.createdAt).toLocaleString()}`;
  info.append(action, meta);

  row.appendChild(info);
  return row;
}

loadUsers();
loadReports();
loadAuditLogs();
