import { getAllEvents, createEvent } from "../api/eventsApi.js";
import { createEventCard } from "../components/eventCard.js";
import { renderEventsMap } from "../components/eventsMap.js";
import { showToast } from "../components/toast.js";
import { openModal } from "../components/modal.js";
import { qs } from "../utils/dom.js";
import { isRequired, isFloatInRange, isIntInRange, getFirstError } from "../utils/validators.js";
import { EVENT_CATEGORIES } from "../utils/eventCategories.js";

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

// Builds the "Create Event" form fresh each time the modal opens, and reads
// its values back when the action button fires - the same prompt()-replacement
// pattern as the report form in eventDetailPage.js, just with more fields.
// Category is a fixed <select> (js/utils/eventCategories.js) rather than a
// free-text box, so events don't end up scattered across inconsistent
// near-duplicate category strings.
function buildCreateEventForm() {
  const form = document.createElement("div");
  form.className = "modal-form";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleLabel.appendChild(titleInput);
  form.appendChild(titleLabel);

  const categoryLabel = document.createElement("label");
  categoryLabel.textContent = "Category";
  const categorySelect = document.createElement("select");
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Select a category";
  categorySelect.appendChild(placeholderOption);
  EVENT_CATEGORIES.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
  categoryLabel.appendChild(categorySelect);
  form.appendChild(categoryLabel);

  const timeRow = document.createElement("div");
  timeRow.className = "modal-form__row";
  const startWrap = document.createElement("div");
  const startLabel = document.createElement("label");
  startLabel.textContent = "Start";
  const startInput = document.createElement("input");
  startInput.type = "datetime-local";
  startLabel.appendChild(startInput);
  startWrap.appendChild(startLabel);
  const endWrap = document.createElement("div");
  const endLabel = document.createElement("label");
  endLabel.textContent = "End";
  const endInput = document.createElement("input");
  endInput.type = "datetime-local";
  endLabel.appendChild(endInput);
  endWrap.appendChild(endLabel);
  timeRow.append(startWrap, endWrap);
  form.appendChild(timeRow);

  const locationRow = document.createElement("div");
  locationRow.className = "modal-form__row";
  const latWrap = document.createElement("div");
  const latLabel = document.createElement("label");
  latLabel.textContent = "Latitude";
  const latInput = document.createElement("input");
  latInput.type = "number";
  latInput.step = "any";
  latLabel.appendChild(latInput);
  latWrap.appendChild(latLabel);
  const lngWrap = document.createElement("div");
  const lngLabel = document.createElement("label");
  lngLabel.textContent = "Longitude";
  const lngInput = document.createElement("input");
  lngInput.type = "number";
  lngInput.step = "any";
  lngLabel.appendChild(lngInput);
  lngWrap.appendChild(lngLabel);
  locationRow.append(latWrap, lngWrap);
  form.appendChild(locationRow);

  const capacityLabel = document.createElement("label");
  capacityLabel.textContent = "Capacity";
  const capacityInput = document.createElement("input");
  capacityInput.type = "number";
  capacityInput.min = "1";
  capacityInput.step = "1";
  capacityLabel.appendChild(capacityInput);
  form.appendChild(capacityLabel);

  return { form, titleInput, categorySelect, startInput, endInput, latInput, lngInput, capacityInput };
}

function validateCreateEventForm({ titleInput, categorySelect, startInput, endInput, latInput, lngInput, capacityInput }) {
  return (
    getFirstError(titleInput.value, [{ test: isRequired, message: "Title is required" }]) ||
    (!categorySelect.value && "Please select a category") ||
    (!startInput.value && "Start time is required") ||
    (!endInput.value && "End time is required") ||
    (startInput.value && endInput.value && new Date(endInput.value) <= new Date(startInput.value) && "End time must be after start time") ||
    getFirstError(latInput.value, [{ test: (v) => isFloatInRange(v, -90, 90), message: "Latitude must be between -90 and 90" }]) ||
    getFirstError(lngInput.value, [{ test: (v) => isFloatInRange(v, -180, 180), message: "Longitude must be between -180 and 180" }]) ||
    getFirstError(capacityInput.value, [{ test: (v) => isIntInRange(v, 1, 100000), message: "Capacity must be a positive number" }]) ||
    null
  );
}

const createEventBtn = qs("#create-event-btn");
if (createEventBtn) {
  createEventBtn.addEventListener("click", () => {
    const fields = buildCreateEventForm();

    openModal({
      title: "Create Event",
      content: fields.form,
      actions: [
        { label: "Cancel", variant: "secondary", onClick: (close) => close() },
        {
          label: "Create",
          variant: "primary",
          onClick: async (close) => {
            const error = validateCreateEventForm(fields);
            if (error) {
              showToast(error, "error");
              return;
            }

            try {
              await createEvent({
                title: fields.titleInput.value.trim(),
                category: fields.categorySelect.value,
                startTime: new Date(fields.startInput.value).toISOString(),
                endTime: new Date(fields.endInput.value).toISOString(),
                location: { lat: Number(fields.latInput.value), lng: Number(fields.lngInput.value) },
                capacity: Number(fields.capacityInput.value),
              });
              close();
              showToast("Event created!", "success");
              loadEvents();
            } catch (submitError) {
              showToast(submitError.message, "error");
            }
          },
        },
      ],
    });
  });
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

    await renderEventsMap(mapContainer, events);
  } catch (error) {
    showMessage("Couldn't load events.");
    showToast(error.message, "error");
  }
}

loadEvents();
