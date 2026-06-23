// Use the local backend while developing on localhost, and the live
// deployed backend everywhere else (e.g. once this is served from GitHub
// Pages) - so the same code works in both places without manual edits.
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocalhost ? "http://localhost:5000" : "https://lonewolf-8i5k.onrender.com";
export const GOOGLE_MAPS_API_KEY = "AIzaSyBRWRKh9_RHi5SCZ9OI7pupkUI11vyjU0E";
