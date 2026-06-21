import { login } from "../api/authApi.js";
import { setSession, isLoggedIn } from "../utils/auth.js";
import { showToast } from "../components/toast.js";
import { qs } from "../utils/dom.js";

if (isLoggedIn()) {
  window.location.href = "events.html";
}

const form = qs("#login-form");
const submitButton = qs("#login-submit");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = qs("#email").value.trim();
  const password = qs("#password").value;

  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  try {
    const data = await login({ email, password });
    setSession(data.token, data.user);
    showToast("Welcome back!", "success");
    window.location.href = "events.html";
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Log In";
  }
});
