import { isLoggedIn, isAdmin, clearSession } from "../utils/auth.js";
import { qs, qsa } from "../utils/dom.js";

function applyAuthVisibility() {
  const loggedIn = isLoggedIn();
  const admin = isAdmin();

  qsa(".auth-only").forEach((el) => {
    el.classList.toggle("is-hidden", !loggedIn);
  });

  qsa(".guest-only").forEach((el) => {
    el.classList.toggle("is-hidden", loggedIn);
  });

  qsa(".admin-only").forEach((el) => {
    el.classList.toggle("is-hidden", !admin);
  });
}

function highlightActiveLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  qsa(".navbar a").forEach((link) => {
    const isActive = link.getAttribute("href") === currentPage;
    link.classList.toggle("navbar__link--active", isActive);
  });
}

function setupLogout() {
  const logoutButton = qs("#logout-btn");
  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });
}

applyAuthVisibility();
highlightActiveLink();
setupLogout();
