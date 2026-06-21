function formatDateRange(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const dateLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const startTimeLabel = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endTimeLabel = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return `${dateLabel} · ${startTimeLabel} - ${endTimeLabel}`;
}

export function createEventCard(event) {
  const card = document.createElement("a");
  card.className = "event-card";
  // No ".html" here on purpose: "serve" (our dev server) auto-redirects
  // *.html?query to the extensionless URL, and that redirect drops the
  // query string. Linking directly to the already-"clean" URL means no
  // redirect ever happens, so ?id=... never gets lost.
  card.href = `event-detail?id=${event._id}`;

  const title = document.createElement("h3");
  title.className = "event-card__title";
  title.textContent = event.title;

  const meta = document.createElement("p");
  meta.className = "event-card__meta";
  meta.textContent = `${event.category} · ${formatDateRange(event.startTime, event.endTime)}`;

  const capacity = document.createElement("p");
  capacity.className = "event-card__capacity";
  capacity.textContent = `${event.participants.length} / ${event.capacity} joined`;

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(capacity);

  return card;
}
