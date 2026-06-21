import { GOOGLE_MAPS_API_KEY } from "../api/config.js";

let scriptLoadingPromise = null;

function loadGoogleMapsScript() {
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

function buildInfoWindowContent(event) {
  const container = document.createElement("div");

  const title = document.createElement("strong");
  title.textContent = event.title;

  const meta = document.createElement("p");
  meta.textContent = event.category;

  const link = document.createElement("a");
  link.href = `event-detail.html?id=${event._id}`;
  link.textContent = "View details";

  container.appendChild(title);
  container.appendChild(meta);
  container.appendChild(link);

  return container;
}

export async function renderEventsMap(containerEl, events) {
  await loadGoogleMapsScript();

  const userLocation = await getUserLocation();

  const map = new google.maps.Map(containerEl, {
    center: { lat: 32.0853, lng: 34.7818 },
    zoom: 12,
  });

  const bounds = new google.maps.LatLngBounds();

  if (userLocation) {
    bounds.extend(userLocation);
    new google.maps.Marker({
      position: userLocation,
      map,
      title: "You are here",
      icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    });
  }

  events.forEach((event) => {
    const position = { lat: event.location.lat, lng: event.location.lng };
    bounds.extend(position);

    const marker = new google.maps.Marker({
      position,
      map,
      title: event.title,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: buildInfoWindowContent(event),
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, 64);
  }
}
