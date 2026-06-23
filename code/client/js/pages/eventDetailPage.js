import { getEventById, joinEvent, leaveEvent, deleteEvent, getCalendarUrl } from "../api/eventsApi.js";
import { submitFeedback, getEventFeedback } from "../api/feedbackApi.js";
import { createReport } from "../api/reportsApi.js";
import { getUser, isLoggedIn, isAdmin } from "../utils/auth.js";
import { showToast } from "../components/toast.js";
import { openModal, showConfirmModal } from "../components/modal.js";
import { loadGoogleMapsScript } from "../components/eventsMap.js";
import { qs } from "../utils/dom.js";
import { isIntInRange, hasMaxLength, getFirstError } from "../utils/validators.js";

// event-detail.html?id=<eventId> - this page only knows which event to show
// through the query string, since there's no client-side router carrying
// state between pages (every page load is a fresh page load).
const eventId = new URLSearchParams(window.location.search).get("id");

const loadingEl = qs("#event-loading");
const contentEl = qs("#event-content");

if (!eventId) {
  loadingEl.textContent = "No event specified.";
} else {
  loadView();
}

// Re-fetches the event and feedback and redraws everything. Called on
// first load, and again after any action that changes what should be on
// screen (join, leave, new feedback) - simpler than patching the DOM in
// a dozen different places for a page this size.
async function loadView() {
  try {
    const [event, feedback] = await Promise.all([getEventById(eventId), getEventFeedback(eventId)]);
    renderEvent(event.data || event);
    renderFeedback(feedback);

    loadingEl.classList.add("is-hidden");
    contentEl.classList.remove("is-hidden");
  } catch (error) {
    loadingEl.textContent = error.message;
  }
}

function renderEvent(event) {
  qs("#event-category").textContent = event.category;
  qs("#event-title").textContent = event.title;

  const start = new Date(event.startTime).toLocaleString();
  const end = new Date(event.endTime).toLocaleString();
  qs("#event-meta").textContent = `${start} - ${end} | Locating address...`;

  resolveAddress(event.location.lat, event.location.lng).then((address) => {
    qs("#event-meta").textContent = `${start} - ${end} | ${address}`;
  });

  const participants = event.participants || [];
  qs("#event-capacity").textContent = `${participants.length} / ${event.capacity} joined`;

  qs("#calendar-link").href = getCalendarUrl(eventId);

  setupJoinLeave(event, participants);
  setupReport();
  setupDelete(event);
}

// Turns raw coordinates into a real, readable address via Google's
// Geocoder (the "reverse" of the address-search-to-coordinates lookup
// the Create Event form does) - "(32.08, 34.78)" means nothing to most
// people. Falls back to the raw coordinates if geocoding fails for any
// reason (no results, network issue), so the page never shows nothing.
async function resolveAddress(lat, lng) {
  try {
    await loadGoogleMapsScript();
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(`(${lat}, ${lng})`);
        }
      });
    });
  } catch {
    return `(${lat}, ${lng})`;
  }
}

// Decides which of Join/Leave to show (or neither, for a logged-out
// visitor) based on two independent facts: is anyone logged in at all, and
// if so, are they already in this event's participant list. That second
// fact can't be known generically the way "is the user logged in" can, so
// this page manages these two buttons itself instead of leaning on
// navbar.js's auth-only/guest-only classes.
function setupJoinLeave(event, participants) {
  const joinBtn = qs("#join-btn");
  const leaveBtn = qs("#leave-btn");
  const user = getUser();

  if (!isLoggedIn()) {
    joinBtn.classList.add("is-hidden");
    leaveBtn.classList.add("is-hidden");
    return;
  }

  const alreadyJoined = participants.some((p) => p === user.id || p._id === user.id);
  joinBtn.classList.toggle("is-hidden", alreadyJoined);
  leaveBtn.classList.toggle("is-hidden", !alreadyJoined);

  joinBtn.onclick = async () => {
    try {
      await joinEvent(eventId);
      showToast("You're in! See you there.", "success");
      loadView();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  leaveBtn.onclick = async () => {
    const confirmed = await showConfirmModal({
      title: "Leave this event?",
      message: "You can rejoin later if there's still room.",
      confirmLabel: "Leave",
    });
    if (!confirmed) return;

    try {
      await leaveEvent(eventId);
      showToast("You've left the event.", "success");
      loadView();
    } catch (error) {
      showToast(error.message, "error");
    }
  };
}

// Opens a modal with a textarea for the report reason - this is the
// "prompt() replacement" use case openModal was built for: build the input
// yourself, read its value when the action button fires.
function setupReport() {
  qs("#report-btn").onclick = () => {
    const textarea = document.createElement("textarea");
    textarea.placeholder = "What's wrong with this event?";
    textarea.className = "feedback-form__report-input";

    openModal({
      title: "Report this event",
      content: textarea,
      actions: [
        { label: "Cancel", variant: "secondary", onClick: (close) => close() },
        {
          label: "Submit Report",
          variant: "primary",
          onClick: async (close) => {
            const reason = textarea.value.trim();
            const error = getFirstError(reason, [
              { test: (v) => v.length > 0, message: "Please describe the issue" },
            ]);
            if (error) {
              showToast(error, "error");
              return;
            }

            try {
              await createReport(eventId, { reason });
              close();
              showToast("Report submitted. Thank you.", "success");
            } catch (submitError) {
              showToast(submitError.message, "error");
            }
          },
        },
      ],
    });
  };
}

// Only the event's host, or any admin, may delete it - matches the
// server's own ownership check in deleteEvent (eventController.js), so the
// button is hidden for everyone else rather than shown and then failing
// with a 403 on click.
function setupDelete(event) {
  const deleteBtn = qs("#delete-btn");
  const user = getUser();

  const canDelete = isLoggedIn() && (user.id === event.hostId || user.id === event.hostId?._id || isAdmin());
  deleteBtn.classList.toggle("is-hidden", !canDelete);

  deleteBtn.onclick = async () => {
    const confirmed = await showConfirmModal({
      title: "Delete this event?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      showToast("Event deleted.", "success");
      window.location.href = "events.html";
    } catch (error) {
      showToast(error.message, "error");
    }
  };
}

function renderFeedback(feedbackList) {
  const list = qs("#feedback-list");
  list.replaceChildren();

  if (feedbackList.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No feedback yet.";
    list.appendChild(empty);
    return;
  }

  feedbackList.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "feedback-item";

    const rating = document.createElement("p");
    rating.className = "feedback-item__rating";
    rating.textContent = `${"★".repeat(entry.rating)}${"☆".repeat(5 - entry.rating)}`;

    const author = document.createElement("p");
    author.className = "feedback-item__author";
    author.textContent = entry.userId?.name || "Anonymous";

    item.appendChild(rating);
    if (entry.comment) {
      const comment = document.createElement("p");
      comment.textContent = entry.comment;
      item.appendChild(comment);
    }
    item.appendChild(author);

    list.appendChild(item);
  });
}

qs("#feedback-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const rating = qs("#feedback-rating").value;
  const comment = qs("#feedback-comment").value.trim();

  const error =
    getFirstError(rating, [{ test: (v) => isIntInRange(v, 1, 5), message: "Rating must be between 1 and 5" }]) ||
    (comment && getFirstError(comment, [{ test: (v) => hasMaxLength(v, 1000), message: "Comment is too long" }]));

  if (error) {
    showToast(error, "error");
    return;
  }

  try {
    await submitFeedback(eventId, { rating: Number(rating), comment });
    showToast("Thanks for your feedback!", "success");
    qs("#feedback-form").reset();
    loadView();
  } catch (submitError) {
    showToast(submitError.message, "error");
  }
});
