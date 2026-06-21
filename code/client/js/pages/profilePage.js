import { getMyProfile, updateMyProfile } from "../api/usersApi.js";
import { showToast } from "../components/toast.js";
import { openModal } from "../components/modal.js";
import { isLoggedIn, clearSession } from "../utils/auth.js";
import { qs } from "../utils/dom.js";
import { isRequired, getFirstError } from "../utils/validators.js";

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

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "profile-card__edit-btn";
  editBtn.textContent = "Edit Profile";
  editBtn.onclick = () => openEditModal(user);

  profileContent.appendChild(name);
  profileContent.appendChild(role);
  profileContent.appendChild(email);
  profileContent.appendChild(interests);
  profileContent.appendChild(memberSince);
  profileContent.appendChild(editBtn);
}

// Builds the edit form by hand and hands it to openModal as `content` -
// this is the same "prompt() replacement" pattern eventDetailPage.js uses
// for its report form: build real inputs, read their .value when the
// modal's own action button fires.
function openEditModal(user) {
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = user.name;

  const interestsInput = document.createElement("input");
  interestsInput.type = "text";
  interestsInput.value = user.interests.join(", ");
  interestsInput.placeholder = "Comma-separated, e.g. Gaming, Hiking";

  const form = document.createElement("div");
  form.className = "auth-form";

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name";

  const interestsLabel = document.createElement("label");
  interestsLabel.textContent = "Interests";

  form.append(nameLabel, nameInput, interestsLabel, interestsInput);

  openModal({
    title: "Edit Profile",
    content: form,
    actions: [
      { label: "Cancel", variant: "secondary", onClick: (close) => close() },
      {
        label: "Save",
        variant: "primary",
        onClick: async (close) => {
          const name = nameInput.value.trim();
          const error = getFirstError(name, [{ test: (v) => isRequired(v), message: "Name is required" }]);
          if (error) {
            showToast(error, "error");
            return;
          }

          const interests = interestsInput.value
            .split(",")
            .map((interest) => interest.trim())
            .filter((interest) => interest.length > 0);

          try {
            await updateMyProfile({ name, interests });
            close();
            showToast("Profile updated.", "success");
            loadProfile();
          } catch (submitError) {
            showToast(submitError.message, "error");
          }
        },
      },
    ],
  });
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
