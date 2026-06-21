import { getAllEvents } from "../api/eventsApi.js";
import { createEventCard } from "../components/eventCard.js";
import { renderEventsMap } from "../components/eventsMap.js";
import { showToast } from "../components/toast.js";
import { qs } from "../utils/dom.js";

const listContainer = qs("#events-list");
const mapContainer = qs("#events-map");
const viewMapBtn = qs("#view-map-btn");
const viewListBtn = qs("#view-list-btn");

function showMessage(text) {
  listContainer.textContent = "";

  const message = document.createElement("p");
  message.className = "page-state";
  message.textContent = text;

  listContainer.appendChild(message);
}

function showMapView() {
  mapContainer.classList.remove("is-hidden");
  listContainer.classList.add("is-hidden");
  viewMapBtn.classList.add("events-view-toggle__btn--active");
  viewListBtn.classList.remove("events-view-toggle__btn--active");
}

function showListView() {
  listContainer.classList.remove("is-hidden");
  mapContainer.classList.add("is-hidden");
  viewListBtn.classList.add("events-view-toggle__btn--active");
  viewMapBtn.classList.remove("events-view-toggle__btn--active");
}

viewMapBtn.addEventListener("click", showMapView);
viewListBtn.addEventListener("click", showListView);

async function loadEvents() {
  showMessage("Loading events...");

  try {
    const result = await getAllEvents();
    const events = result.data;

    if (events.length === 0) {
      showMessage("No events found yet.");
      return;
    }

    listContainer.textContent = "";
    events.forEach((event) => {
      listContainer.appendChild(createEventCard(event));
    });

    await renderEventsMap(mapContainer, events);
  } catch (error) {
    showMessage("Couldn't load events.");
    showToast(error.message, "error");
  }
}

loadEvents();
