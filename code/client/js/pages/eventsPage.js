import { getAllEvents } from "../api/eventsApi.js";
import { createEventCard } from "../components/eventCard.js";
import { showToast } from "../components/toast.js";
import { qs } from "../utils/dom.js";

const listContainer = qs("#events-list");

function showMessage(text) {
  listContainer.textContent = "";

  const message = document.createElement("p");
  message.className = "page-state";
  message.textContent = text;

  listContainer.appendChild(message);
}

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
  } catch (error) {
    showMessage("Couldn't load events.");
    showToast(error.message, "error");
  }
}

loadEvents();
