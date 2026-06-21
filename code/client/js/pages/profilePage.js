import { getMyProfile } from "../api/usersApi.js";
import { showToast } from "../components/toast.js";
import { isLoggedIn, clearSession } from "../utils/auth.js";
import { qs } from "../utils/dom.js";

if (!isLoggedIn()) {
  window.location.href = "login.html";
}

const profileContent = qs("#profile-content");

function showMessage(text) {
  profileContent.textContent = "";

  const message = document.createElement("p");
  message.className = "page-state";
  message.textContent = text;

  profileContent.appendChild(message);
}

function renderProfile(user) {
  profileContent.textContent = "";

  const name = document.createElement("h2");
  name.className = "profile-card__name";
  name.textContent = user.name;

  const role = document.createElement("span");
  role.className = `profile-card__role profile-card__role--${user.role}`;
  role.textContent = user.role;

  const email = document.createElement("p");
  email.className = "profile-card__detail";
  email.textContent = user.email;

  const interests = document.createElement("p");
  interests.className = "profile-card__detail";
  interests.textContent =
    user.interests.length > 0 ? `Interests: ${user.interests.join(", ")}` : "No interests added yet.";

  const memberSince = document.createElement("p");
  memberSince.className = "profile-card__detail";
  const joinedDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  memberSince.textContent = `Member since ${joinedDate}`;

  profileContent.appendChild(name);
  profileContent.appendChild(role);
  profileContent.appendChild(email);
  profileContent.appendChild(interests);
  profileContent.appendChild(memberSince);
}

async function loadProfile() {
  showMessage("Loading profile...");

  try {
    const user = await getMyProfile();
    renderProfile(user);
  } catch (error) {
    showToast(error.message, "error");
    clearSession();
    window.location.href = "login.html";
  }
}

loadProfile();
